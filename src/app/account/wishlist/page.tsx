"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/lib/wishlist'

export default function WishlistPage() {
  const { user } = useAuth()
  const wishlist = useWishlist()
  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p>Please sign in to view your wishlist.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }
  const items = wishlist.items
  return (
    <div className="max-w-4xl mx-auto card p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-gray-600 text-sm">Your wishlist is empty. Browse products and tap the heart to save them.</div>
      ) : (
        <ul className="divide-y">
          {items.map(({ product }) => (
            <li key={product.id} className="py-4 flex items-center justify-between gap-4">
              <Link href={`/products/${product.id}`} className="flex items-center gap-4 group">
                <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-100">
                  <Image src={product.image || '/og.svg'} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <div className="font-medium group-hover:underline">{product.name}</div>
                  <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Link href={`/products/${product.id}`} className="btn btn-sm">View</Link>
                <button className="btn btn-sm btn-outline" onClick={() => wishlist.remove(product.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
