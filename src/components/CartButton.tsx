"use client"
import { useCart } from '@/lib/cart'

export default function CartButton() {
  const { count, setOpen } = useCart()
  return (
  <button className="relative btn sm:btn inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5" onClick={() => setOpen(true)} aria-label="Open cart">
      <span aria-hidden>
        {/* Cart icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      </span>
  <span className="hidden lg:inline">Cart</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand text-white rounded-full text-xs px-2 py-0.5">
          {count}
        </span>
      )}
    </button>
  )
}
