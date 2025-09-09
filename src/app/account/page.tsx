"use client"
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import type { Order } from '@/lib/types'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

interface DisplayOrder extends Order { backendId?: string; code?: string }

export default function AccountPage() {
  const { user, logout, authReady } = useAuth()
  const [orders, setOrders] = useState<DisplayOrder[]>([])

  useEffect(() => {
    if (!user) return
    const u = user
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          // Fetch orders by user_id or fallback to email
          const { data: rows, error } = await supabase
            .from('orders')
            .select('*')
            .or(`user_id.eq.${u.id},email.ilike.${u.email}`)
            .order('created_at', { ascending: false })
          if (!error && rows) {
            // Fetch item counts for these orders
            const ids = rows.map((r: any) => r.id)
            let counts: Record<string, number> = {}
            if (ids.length) {
              const { data: items } = await supabase
                .from('order_items')
                .select('order_id, qty')
                .in('order_id', ids)
              if (items) {
                for (const it of items as any[]) {
                  counts[it.order_id] = (counts[it.order_id] || 0) + Number(it.qty || 0)
                }
              }
            }
  const mapped: DisplayOrder[] = rows.map((r: any) => ({
      // Use human code or short suffix of UUID for consistent display
      id: r.code || (typeof r.id === 'string' && r.id.includes('-') ? 'ORD-' + r.id.split('-').pop().toUpperCase() : r.id),
      backendId: r.id,
      code: r.code,
              createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
              customer: {
                fullName: r.customer_name || '',
                email: r.email || u.email,
        phone: r.phone || '',
                address: r.address || '',
                city: r.city || '',
                country: r.country || '',
              },
              // Build a dummy items array for count display
              items: Array.from({ length: counts[r.id] || 0 }, () => ({
                product: { id: 'unknown', name: 'Item', description: '', price: 0, image: '', images: [], category: 'misc', tags: [], created_at: '' },
                qty: 1,
              })),
              subtotal: Number(r.subtotal || 0),
              shipping: Number(r.shipping || 0),
              total: Number(r.total || 0),
              payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
              status: (r.status || 'pending') as any,
              created_at: r.created_at,
            }))
            setOrders(mapped)
            return
          }
        } catch {}
      }
      // Fallback to local demo orders
      try {
        const raw = localStorage.getItem('storefront.orders.v1')
    const all: Order[] = raw ? JSON.parse(raw) : []
  setOrders(all.filter((o) => o.customer.email.toLowerCase() === u.email.toLowerCase()).map(o => ({ ...o })))
      } catch {}
    }
    load()
  }, [user])

  if (!authReady) {
    return <div className="max-w-md mx-auto card p-6 animate-pulse space-y-4">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-10 w-2/3 bg-gray-200 rounded" />
    </div>
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-gray-600">Sign in or create an account to view your orders.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name || 'there'} 👋</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your orders, favorites and profile details.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/account/profile" className="btn">Profile</Link>
          <button className="btn" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60">
          <div className="text-xs font-medium tracking-wide text-gray-500 mb-1">Orders</div>
          <div className="text-2xl font-semibold">{orders.length}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60">
          <div className="text-xs font-medium tracking-wide text-gray-500 mb-1">Total Spent (approx)</div>
          <div className="text-2xl font-semibold">{formatCurrencyBDT(orders.reduce((n,o)=>n+o.total,0))}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60">
          <div className="text-xs font-medium tracking-wide text-gray-500 mb-1">Last Order</div>
          <div className="text-sm font-medium truncate max-w-[140px]">{orders[0]?.id || '—'}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No orders yet. Start shopping!</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            {orders.slice(0,5).map(o => {
              const itemCount = o.items.length
              return (
                <li key={o.id} className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-gray-500">#</span>
                      <code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">{o.id}</code>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{o.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                      {itemCount} item{itemCount!==1 && 's'} · {formatCurrencyBDT(o.total)} · {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/account/orders/${encodeURIComponent((o as any).code || (o as any).backendId || o.id)}`} className="btn btn-xs btn-primary">Track</Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/account/wishlist" className="group rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="text-sm font-semibold mb-1">Wishlist</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Out-of-stock saved items</p>
        </Link>
  <Link href="/account/favorites" className="group rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="text-sm font-semibold mb-1">Favorites</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">View saved items</p>
        </Link>
        <Link href="/account/profile" className="group rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="text-sm font-semibold mb-1">Profile Details</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Update info & address</p>
        </Link>
        <Link href="/account/orders" className="group rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="text-sm font-semibold mb-1">Full Order History</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">All past purchases</p>
        </Link>
      </div>
    </div>
  )
}
