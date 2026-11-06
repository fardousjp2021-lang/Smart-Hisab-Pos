// Lightweight in-browser error log for the admin health page.
// Captures window errors + unhandled promise rejections and persists a short
// ring buffer in localStorage so refresh doesn't lose recent failures.

const STORAGE_KEY = "admin:client-error-log:v1";
const MAX_ENTRIES = 100;

export interface ClientErrorEntry {
  id: string;
  at: number;
  kind: "error" | "unhandledrejection" | "manual";
  message: string;
  stack?: string;
  source?: string;
  url?: string;
}

type Listener = (entries: ClientErrorEntry[]) => void;
const listeners = new Set<Listener>();
let installed = false;

function load(): ClientErrorEntry[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClientErrorEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: ClientErrorEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {}
  listeners.forEach((l) => {
    try {
      l(entries);
    } catch {}
  });
}

function push(entry: Omit<ClientErrorEntry, "id" | "at">) {
  const full: ClientErrorEntry = {
    ...entry,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };
  const next = [...load(), full].slice(-MAX_ENTRIES);
  save(next);
}

export function getEntries(): ClientErrorEntry[] {
  return load();
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  cb(load());
  return () => listeners.delete(cb);
}

export function clearEntries(): void {
  save([]);
}

export function logManual(message: string, extra?: Partial<ClientErrorEntry>): void {
  push({ kind: "manual", message, ...extra });
}

export function installClientErrorCapture(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    const err = event.error;
    push({
      kind: "error",
      message: err?.message ?? event.message ?? "Unknown error",
      stack: err?.stack,
      source: event.filename,
      url: window.location.pathname,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: any = event.reason;
    push({
      kind: "unhandledrejection",
      message:
        (reason && (reason.message || String(reason))) || "Unhandled promise rejection",
      stack: reason?.stack,
      url: window.location.pathname,
    });
  });
}
