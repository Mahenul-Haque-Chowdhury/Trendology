"use client"
import { CartProvider } from '@/lib/cart'
import { AuthProvider } from '@/lib/auth'
// Wishlist deprecated -> replaced by Favorites
import { FavoritesProvider } from '@/lib/favorites'
import { WishlistProvider } from '@/lib/wishlist'
import AppReady from './AppReady'
import { ToastProvider } from './ToastStack'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <FavoritesProvider>
            <ToastProvider>
              <AppReady>
                {children}
              </AppReady>
            </ToastProvider>
          </FavoritesProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
