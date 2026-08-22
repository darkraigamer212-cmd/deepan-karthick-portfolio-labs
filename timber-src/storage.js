const STORAGE_KEY = "deepan.timber-cft-demo.invoices.v1";

export class StorageDataError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "StorageDataError";
  }
}

function readAll() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new TypeError("Stored invoice data is not a list.");
    return parsed;
  } catch (error) {
    throw new StorageDataError("Saved invoice history is damaged. Export or clear it before saving new data.", error);
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `invoice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function listInvoices() {
  return readAll().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function saveInvoice(invoice) {
  const invoices = readAll();
  const id = invoice.id || createId();
  const now = new Date().toISOString();
  const saved = { ...invoice, id, updatedAt: now, createdAt: invoice.createdAt || now };
  const next = [saved, ...invoices.filter((item) => item.id !== id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return saved;
}

export function deleteInvoice(id) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readAll().filter((item) => item.id !== id)));
}

export function clearDemoInvoices() {
  localStorage.removeItem(STORAGE_KEY);
}
