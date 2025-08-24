"use client"
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
import { WishlistProvider } from '@/lib/wishlist'
import AppReady from './AppReady'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppReady>
            {children}
          </AppReady>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
