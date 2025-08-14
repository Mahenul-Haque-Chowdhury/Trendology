"use client"
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
import { WishlistProvider } from '@/lib/wishlist'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
