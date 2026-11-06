// @ts-nocheck
// Batch & Expiry tracking — localStorage-backed, offline-safe.
// Does not touch existing Firestore collections or business logic.

export interface BatchRecord {
  id: string;
  productId: string;
  productName?: string;
  batchNumber: string;
  manufacturingDate?: string; // ISO yyyy-mm-dd
  expiryDate?: string;        // ISO yyyy-mm-dd
  supplier?: string;
  purchaseDate?: string;      // ISO yyyy-mm-dd
  quantity?: number;
  note?: string;
  createdAt: string;
}

const KEY = 'roni_batch_expiry_v1';

export function loadBatches(): BatchRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveBatches(list: BatchRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'notice' | 'ok' | 'none';

export function expiryStatus(dateStr?: string): ExpiryStatus {
  const d = daysUntil(dateStr);
  if (d === null) return 'none';
  if (d < 0) return 'expired';
  if (d <= 7) return 'critical';
  if (d <= 15) return 'warning';
  if (d <= 30) return 'notice';
  return 'ok';
}

// Returns true if the product has any active batch that is NOT expired.
// If the product has no batch records at all → not managed, allow sale.
export function isProductSellable(productId: string): { sellable: boolean; reason?: string } {
  const batches = loadBatches().filter(b => b.productId === productId);
  if (batches.length === 0) return { sellable: true };
  const nonExpired = batches.filter(b => expiryStatus(b.expiryDate) !== 'expired');
  if (nonExpired.length === 0) {
    return { sellable: false, reason: 'All batches expired' };
  }
  return { sellable: true };
}
