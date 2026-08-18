export function formatMoney(amount: string | number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Converts an ISO string to the value a <input type="datetime-local">
// expects, in the browser's local timezone.
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Converts a <input type="datetime-local"> value (local time, no timezone)
// back into an unambiguous ISO string for the API.
export function fromDatetimeLocalValue(localValue: string): string | undefined {
  if (!localValue) return undefined
  return new Date(localValue).toISOString()
}
