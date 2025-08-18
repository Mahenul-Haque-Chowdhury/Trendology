"use client"
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import type { Order } from '@/lib/types'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

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
            .or(`user_id.eq.${u.id},email.eq.${u.email}`)
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
      const mapped: Order[] = rows.map((r: any) => ({
              id: r.id,
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
                product: { id: 'unknown', name: 'Item', description: '', price: 0, image: '', images: [], category: 'misc', tags: [] },
                qty: 1,
              })),
              subtotal: Number(r.subtotal || 0),
              shipping: Number(r.shipping || 0),
              total: Number(r.total || 0),
              payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
              status: (r.status || 'pending') as any,
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
  setOrders(all.filter((o) => o.customer.email.toLowerCase() === u.email.toLowerCase()))
      } catch {}
    }
    load()
  }, [user])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <div className="flex gap-2">
          <Link href="/account/profile" className="btn">EditProfile</Link>
          <button className="btn" onClick={logout}>Sign Out</button>
        </div>
      </div>

      <section className="card p-4">
        <h2 className="text-lg font-semibold mb-3">My Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Order #{o.id}</div>
                  <div className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm text-gray-600">{o.items.length} item(s) · {formatCurrencyBDT(o.total)} · {o.status}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
