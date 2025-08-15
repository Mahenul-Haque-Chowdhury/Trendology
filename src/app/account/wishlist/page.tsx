"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/lib/wishlist'
import { useCart } from '@/lib/cart'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WishlistPage() {
  const { user } = useAuth()
  const wishlist = useWishlist()
  const cart = useCart()
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allIds = useMemo(() => new Set(wishlist.items.map((it) => it.product.id)), [wishlist.items])
  const selectAllRef = useRef<HTMLInputElement | null>(null)

  // Keep selected set in sync if wishlist changes
  useEffect(() => {
    setSelected((prev) => new Set([...prev].filter((id) => allIds.has(id))))
  }, [allIds])

  // Update indeterminate state
  useEffect(() => {
    if (!selectAllRef.current) return
    const count = selected.size
    const total = allIds.size
    selectAllRef.current.indeterminate = count > 0 && count < total
  }, [selected, allIds])

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(allIds) : new Set())
  }

  const onCheckout = () => {
    const toAdd = wishlist.items.filter(({ product }) => selected.has(product.id))
    if (toAdd.length === 0) return
    for (const { product } of toAdd) cart.add(product, 1)
    router.push('/checkout')
  }
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
        <div className="space-y-3">
          {/* Bulk controls */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={selected.size > 0 && selected.size === allIds.size}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span className="text-sm">Select all</span>
            </label>
            {selected.size > 0 && (
              <button className="btn btn-primary btn-sm" onClick={onCheckout}>
                Checkout {selected.size} item{selected.size > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <ul className="divide-y">
            {items.map(({ product }) => (
              <li key={product.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                  <Link href={`/products/${product.id}`} className="flex items-center gap-4 group min-w-0">
                    <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-100 shrink-0">
                      <Image src={product.image || '/og.svg'} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium group-hover:underline truncate">{product.name}</div>
                      <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/products/${product.id}`} className="btn btn-sm">View</Link>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => { setSelected((prev) => { const next = new Set(prev); next.delete(product.id); return next }); wishlist.remove(product.id) }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
