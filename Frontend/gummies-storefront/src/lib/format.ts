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
