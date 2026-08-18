import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { CartContext } from './cart-context'
import type { CartLine } from '@/types/cart'

const STORAGE_KEY = 'gummies_cart'

function loadInitialLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadInitialLines)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  function addItem(line: Omit<CartLine, 'quantity'>, quantity: number) {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId)
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, line.availableQuantity)
        return prev.map((l) => (l.variantId === line.variantId ? { ...l, quantity: nextQuantity } : l))
      }
      return [...prev, { ...line, quantity: Math.min(quantity, line.availableQuantity) }]
    })
    toast.success(`${line.productName} added to cart`)
  }

  function updateQuantity(variantId: string, quantity: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(quantity, l.availableQuantity) } : l))
        .filter((l) => l.quantity > 0)
    )
  }

  function removeItem(variantId: string) {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }

  function clear() {
    setLines([])
  }

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + Number(l.price) * l.quantity, 0), [lines])

  return (
    <CartContext.Provider value={{ lines, itemCount, subtotal, addItem, updateQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}
