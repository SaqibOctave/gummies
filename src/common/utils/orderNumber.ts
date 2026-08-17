import crypto from 'crypto';

// Human-friendly, sortable order number: GUM-YYYYMMDD-XXXXXX
export function generateOrderNumber(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `GUM-${y}${m}${d}-${random}`;
}
