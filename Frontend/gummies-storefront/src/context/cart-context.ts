import { createContext, useContext } from 'react'
import type { CartLine } from '@/types/cart'

export interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addItem: (line: Omit<CartLine, 'quantity'>, quantity: number) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
