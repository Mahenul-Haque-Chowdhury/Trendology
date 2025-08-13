"use client"
import { useCart } from '@/lib/cart'

export default function CartButton() {
  const { count, setOpen } = useCart()
  return (
    <button className="relative btn" onClick={() => setOpen(true)} aria-label="Open cart">
      <span>Cart</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand text-white rounded-full text-xs px-2 py-0.5">
          {count}
        </span>
      )}
    </button>
  )
}
