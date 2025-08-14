"use client"
import { useWishlist } from '@/lib/wishlist'

export default function WishlistButton() {
  const { items } = useWishlist()
  const count = items.length
  return (
    <button className="relative btn sm:btn inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5" aria-label="Open wishlist" onClick={() => {
      // For now, navigate to account wishlist page
      window.location.href = '/account/wishlist'
    }}>
      <span aria-hidden>
        {/* Heart icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.88.5 9.5.5 6.462 2.962 4 6 4c1.657 0 3.156.81 4.1 2.053C11.844 4.81 13.343 4 15 4c3.038 0 5.5 2.462 5.5 5.5 0 1.38-.36 2.726-2.072 4.438C18.716 16.65 12 21 12 21z"/></svg>
      </span>
  <span className="hidden lg:inline">Wishlist</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand text-white rounded-full text-xs px-2 py-0.5">{count}</span>
      )}
    </button>
  )
}
