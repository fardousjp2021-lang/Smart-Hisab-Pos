import { doc, setDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

export type SyncKind =
  | 'sale'
  | 'stock'
  | 'purchase'
  | 'expense'
  | 'quotation'
  | 'quotation_delete'
  | 'sales_return'
  | 'purchase_return'
  | 'customer'
  | 'supplier';

export type SyncItem = {
  id: string;
  kind: SyncKind;
  refId: string;
  label?: string;
  collection: string;
  payload: any;
  attempts: number;
  status: 'queued' | 'syncing' | 'succeeded' | 'failed';
  queuedAt: number;
  updatedAt: number;
  lastAttemptAt?: number;
  error?: string;
  workspaceId?: string;
};

export type SyncConflict = {
  at: number;
  kind: string;
  refId: string;
  reason: string;
  existingUpdatedAt?: number;
  incomingUpdatedAt?: number;
};

const QUEUE_KEY = 'pos_sync_queue_v2';
const CONFLICTS_KEY = 'pos_sync_conflicts_v1';

const listeners: Array<(items: SyncItem[]) => void> = [];

function loadQueue(): SyncItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(items: SyncItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
    notifyListeners(items);
  } catch (e) {
    console.error('[SyncQueue] Failed to save queue', e);
  }
}

function notifyListeners(items: SyncItem[]) {
  listeners.forEach((cb) => cb(items));
}

export function getItems(): SyncItem[] {
  return loadQueue();
}

export function subscribeItems(cb: (items: SyncItem[]) => void): () => void {
  listeners.push(cb);
  cb(loadQueue());
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function logConflict(conflict: Omit<SyncConflict, 'at'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CONFLICTS_KEY);
    const existing: SyncConflict[] = raw ? JSON.parse(raw) : [];
    existing.push({ ...conflict, at: Date.now() });
    const bounded = existing.slice(-100);
    localStorage.setItem(CONFLICTS_KEY, JSON.stringify(bounded));
  } catch (e) {
    console.error('[SyncQueue] Failed to log conflict', e);
  }
}

export function getConflicts(): SyncConflict[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONFLICTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearConflicts() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONFLICTS_KEY);
  } catch {}
}

export function enqueueItem(
  kind: SyncKind,
  collectionName: string,
  refId: string,
  payload: any,
  label?: string
) {
  const queue = loadQueue();
  const existingIdx = queue.findIndex((i) => i.kind === kind && i.refId === refId);
  const now = Date.now();

  if (existingIdx >= 0) {
    // Idempotent update: update existing item payload and reset status
    queue[existingIdx] = {
      ...queue[existingIdx],
      payload,
      label: label || queue[existingIdx].label,
      status: 'queued',
      updatedAt: now,
      error: undefined,
    };
  } else {
    // Add new item
    const newItem: SyncItem = {
      id: `sync_${now}_${Math.random().toString(36).slice(2, 7)}`,
      kind,
      collection: collectionName,
      refId,
      label,
      payload,
      attempts: 0,
      status: 'queued',
      queuedAt: now,
      updatedAt: now,
      workspaceId: payload?.workspaceId,
    };
    queue.push(newItem);
  }

  saveQueue(queue);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    flushQueue().catch(() => {});
  }
}

export function enqueueSales(sales: any[]) {
  sales.forEach((s) => {
    enqueueItem('sale', 'sales', s.id || `sale_${Date.now()}`, s, s.customerName || s.id);
  });
}

export function enqueuePurchase(data: any, label?: string) {
  enqueueItem('purchase', 'purchases', data.id || `pur_${Date.now()}`, data, label || data.supplierName);
}

export function enqueueExpense(data: any, label?: string) {
  enqueueItem('expense', 'expenses', data.id || `exp_${Date.now()}`, data, label || data.category);
}

export function enqueueStockUpdate(id: string, delta?: number, name?: string, stock?: number) {
  enqueueItem(
    'stock',
    'products',
    id,
    { id, delta, productName: name, stock, updatedAt: new Date().toISOString() },
    name ? `Stock: ${name}` : id
  );
}

export function enqueueQuotation(data: any, label?: string) {
  enqueueItem('quotation', 'quotations', data.id || `qt_${Date.now()}`, data, label || data.customerName);
}

export function enqueueQuotationDelete(id: string) {
  enqueueItem('quotation_delete', 'quotations', id, { id }, `Delete Quotation ${id}`);
}

export function enqueueSalesReturn(data: any, label?: string) {
  enqueueItem('sales_return', 'salesReturns', data.id || `rtn_${Date.now()}`, data, label || data.customerName);
}

export function enqueuePurchaseReturn(data: any, label?: string) {
  enqueueItem('purchase_return', 'purchaseReturns', data.id || `prtn_${Date.now()}`, data, label || data.supplierName);
}

export async function writeItem(item: SyncItem): Promise<void> {
  const { kind, collection: col, refId, payload } = item;

  if (kind === 'quotation_delete') {
    await deleteDoc(doc(db, col, refId));
    return;
  }

  if (kind === 'stock') {
    const productRef = doc(db, 'products', refId);
    if (typeof payload.stock === 'number') {
      await updateDoc(productRef, { stock: payload.stock, updatedAt: payload.updatedAt });
    } else if (typeof payload.delta === 'number') {
      await runTransaction(db, async (tx) => {
        const pSnap = await tx.get(productRef);
        if (pSnap.exists()) {
          const current = Number(pSnap.data().stock || 0);
          const nextStock = Math.max(0, current + payload.delta);
          tx.update(productRef, { stock: nextStock, updatedAt: new Date().toISOString() });
        }
      });
    }
    return;
  }

  // General setDoc for sales, purchases, expenses, quotations, returns, etc.
  await setDoc(doc(db, col, refId), payload, { merge: true });
}

export async function flushQueue(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const queue = loadQueue();
  const pending = queue.filter((i) => i.status === 'queued' || i.status === 'failed');

  if (pending.length === 0) return;

  for (const item of pending) {
    item.status = 'syncing';
    item.attempts += 1;
    item.lastAttemptAt = Date.now();
    saveQueue(queue);

    try {
      await writeItem(item);
      item.status = 'succeeded';
      item.updatedAt = Date.now();
      item.error = undefined;
    } catch (err: any) {
      item.status = 'failed';
      item.updatedAt = Date.now();
      item.error = err?.message || String(err);
      console.warn(`[SyncQueue] Write failed for ${item.kind} (${item.refId}):`, err);
    }

    saveQueue(queue);
  }
}

export function retryItem(id: string) {
  const queue = loadQueue();
  const item = queue.find((i) => i.id === id);
  if (item) {
    item.status = 'queued';
    item.error = undefined;
    saveQueue(queue);
    flushQueue().catch(() => {});
  }
}

export function retryAllFailed() {
  const queue = loadQueue();
  let changed = false;
  queue.forEach((item) => {
    if (item.status === 'failed') {
      item.status = 'queued';
      item.error = undefined;
      changed = true;
    }
  });
  if (changed) {
    saveQueue(queue);
    flushQueue().catch(() => {});
  }
}

export function removeItem(id: string) {
  const queue = loadQueue();
  const filtered = queue.filter((i) => i.id !== id);
  saveQueue(filtered);
}

export function clearSucceeded() {
  const queue = loadQueue();
  const filtered = queue.filter((i) => i.status !== 'succeeded');
  saveQueue(filtered);
}

export function pruneSyncHistory(days = 14): number {
  const queue = loadQueue();
  const cutoff = Date.now() - days * 86400_000;
  let removedCount = 0;

  const filtered = queue.filter((item) => {
    if (item.status === 'succeeded' && item.updatedAt < cutoff) {
      removedCount++;
      return false;
    }
    return true;
  });

  if (removedCount > 0) {
    saveQueue(filtered);
  }
  return removedCount;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushQueue().catch(() => {});
  });
}

export const salesSyncQueue = {
  getItems,
  subscribeItems,
  enqueueItem,
  enqueueSales,
  enqueuePurchase,
  enqueueExpense,
  enqueueStockUpdate,
  enqueueQuotation,
  enqueueQuotationDelete,
  enqueueSalesReturn,
  enqueuePurchaseReturn,
  writeItem,
  flushQueue,
  retryItem,
  retryAllFailed,
  removeItem,
  clearSucceeded,
  getConflicts,
  clearConflicts,
  pruneSyncHistory,
};
