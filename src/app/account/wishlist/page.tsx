"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import Image from 'next/image'
import { useWishlist } from '@/lib/wishlist'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useCart } from '@/lib/cart'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function WishlistPage() {
  const { user } = useAuth()
  const wishlist = useWishlist()
  const cart = useCart()
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null
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

  // Notification modal state (outside of any handler so React can track state)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)

  const onNotify = () => {
    if (selected.size === 0) return
    setShowNotifyModal(true)
  }

  const confirmNotify = async () => {
    setSending(true)
    try {
      // Register each selected product in restock_requests (ignore duplicates)
      if (supabase && user) {
        const productIds = [...selected]
        for (const pid of productIds) {
          try {
            const { error } = await supabase.from('restock_requests').insert({ user_id: user.id, product_id: pid })
            if (error && !String(error.message).includes('duplicate key')) console.warn('restock insert failed', error.message)
          } catch (e:any) {
            console.warn('restock insert unexpected', e?.message || e)
          }
        }
      } else {
        // Fallback delay
        await new Promise(r => setTimeout(r, 400))
      }
      setSentCount(selected.size)
      setSelected(new Set())
    } finally {
      setSending(false)
      setTimeout(() => { setShowNotifyModal(false); setSentCount(null) }, 1800)
    }
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
    <motion.div
      className="max-w-4xl mx-auto card p-6 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-gray-600 text-sm">Your wishlist is empty. Browse products and tap the heart to save them.</div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select out-of-stock products you want to be emailed about.</p>
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
              <button className="btn btn-primary btn-sm" onClick={onNotify}>
                Notify me for {selected.size} item{selected.size > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <ul className="divide-y">
            {items.map(({ product }) => (
              <li key={product.id} className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          {supabase && user && (
            <RestockInterestSummary productIds={items.map(i => i.product.id)} />
          )}
        </div>
      )}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !sending && setShowNotifyModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Restock Notification</h2>
            {sentCount === null ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">We&apos;ll email you when these product{selected.size > 1 ? 's' : ''} come back in stock.</p>
                <ul className="max-h-40 overflow-auto text-sm list-disc ml-5 pr-1 space-y-1">
                  {wishlist.items.filter(({ product }) => selected.has(product.id)).map(({ product }) => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2 pt-2">
                  <button disabled={sending} onClick={() => setShowNotifyModal(false)} className="btn btn-sm">Cancel</button>
                  <button disabled={sending} onClick={confirmNotify} className="btn btn-primary btn-sm inline-flex items-center gap-2">
                    {sending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />} Confirm Notify
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-sm font-medium">You&apos;ll be notified for {sentCount} product{sentCount > 1 ? 's' : ''}.</p>
                <p className="text-xs text-gray-500 text-center">We will send a single email when any selected item is restocked.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Component to fetch and display restock interest counts
function RestockInterestSummary({ productIds }: { productIds: string[] }) {
  const supabase = getSupabaseClient()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const idsKey = productIds.join(',')
  useEffect(() => {
    let ignore = false
    async function load() {
      if (!supabase || productIds.length === 0) return
      const { data, error } = await supabase.from('restock_request_counts').select('*').in('product_id', productIds)
      if (!ignore && data && !error) {
        const map: Record<string, number> = {}
        for (const r of data) map[r.product_id] = r.request_count
        setCounts(map)
      }
    }
    load()
    return () => { ignore = true }
  }, [supabase, idsKey])
  if (Object.keys(counts).length === 0) return null
  return (
    <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50">
      <h3 className="text-sm font-semibold mb-2">Customer Interest</h3>
      <ul className="text-xs space-y-1 max-h-40 overflow-auto pr-1">
        {Object.entries(counts).map(([pid, c]) => (
          <li key={pid} className="flex items-center justify-between"><span className="truncate w-2/3" title={pid}>{pid}</span><span className="font-medium text-gray-700">{c} request{c>1?'s':''}</span></li>
        ))}
      </ul>
    </div>
  )
}
