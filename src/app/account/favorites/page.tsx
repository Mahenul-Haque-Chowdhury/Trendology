"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import Image from 'next/image'
import { useFavorites } from '@/lib/favorites'
import { useCart } from '@/lib/cart'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const { user } = useAuth()
  const favorites = useFavorites()
  const cart = useCart()
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allIds = useMemo(() => new Set(favorites.items.map((it) => it.product.id)), [favorites.items])
  const selectAllRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setSelected((prev) => new Set([...prev].filter((id) => allIds.has(id))))
  }, [allIds])

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

  const onNotify = () => {
    // Placeholder for future notification subscription
    alert('You will be notified when selected items are back in stock (stub).')
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <p>Please sign in to view your favorites.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }
  const items = favorites.items
  return (
    <motion.div
      className="max-w-4xl mx-auto card p-6 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
  <h1 className="text-2xl font-bold">My Favorites</h1>
  <p className="text-sm text-gray-600 dark:text-gray-400">In-stock items you saved for later checkout.</p>
      {items.length === 0 ? (
        <div className="text-gray-600 text-sm">No favorites yet. Tap the heart on any in-stock product to save it for later.</div>
      ) : (
        <div className="space-y-3">
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
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    const toAdd = favorites.items.filter(({ product }) => selected.has(product.id))
                    for (const { product } of toAdd) cart.add(product, 1, { openDrawer: false })
                    router.push('/checkout')
                  }}
                >Checkout Selected</button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    const toAdd = favorites.items.filter(({ product }) => selected.has(product.id))
                    for (const { product } of toAdd) cart.add(product, 1, { openDrawer: false })
                    setSelected(new Set())
                  }}
                >Add to Cart</button>
              </div>
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
                      <div className="text-sm text-gray-500">{formatCurrencyBDT(product.price)}</div>
                      {product.active !== true && <div className="text-xs text-rose-600 font-medium mt-0.5">Out of stock</div>}
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {product.active !== false && (
                    <button className="btn btn-sm btn-outline" onClick={() => { cart.add(product,1,{ openDrawer: false }); }}>Add to Cart</button>
                  )}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => { setSelected((prev) => { const next = new Set(prev); next.delete(product.id); return next }); favorites.remove(product.id) }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
