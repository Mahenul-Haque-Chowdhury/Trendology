"use client"
import { useEffect, useMemo, useState } from 'react'
import type { Order, OrderStatus } from '@/lib/types'
import Link from 'next/link'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useCatalog } from '@/lib/catalog'

function useOrders(products: ReturnType<typeof useCatalog>['products']) {
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from Supabase if available; else fallback to localStorage
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          const { data: rows, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
          if (!error && rows) {
            const ids = rows.map((r: any) => r.id)
            const { data: itemsRows } = await supabase
              .from('order_items')
              .select('*')
              .in('order_id', ids)
            const itemsByOrder = new Map<string, any[]>()
            for (const it of itemsRows || []) {
              const arr = itemsByOrder.get(it.order_id) || []
              arr.push(it)
              itemsByOrder.set(it.order_id, arr)
            }
            const mapped: Order[] = rows.map((r: any) => {
              const rawItems = itemsByOrder.get(r.id) || []
              const items = rawItems
                .map((ri) => {
                  const p = products.find((p) => p.id === ri.product_id)
                  return p ? { product: p, qty: ri.qty as number } : null
                })
                .filter(Boolean) as Order['items']
              const displayId: string = r.code || (typeof r.id === 'string' && r.id.includes('-')
                ? 'ORD-' + r.id.split('-').pop().toUpperCase()
                : String(r.id))
              return {
                id: displayId,
                createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
                customer: {
                  fullName: r.customer_name || '',
                  email: r.email || '',
                  phone: r.phone || '',
                  address: r.address || '',
                  city: r.city || '',
                  country: r.country || '',
                },
                items,
                subtotal: Number(r.subtotal || 0),
                shipping: Number(r.shipping || 0),
                total: Number(r.total || 0),
                payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
                status: (r.status || 'pending') as OrderStatus,
              }
            })
            if (!cancelled) setOrders(mapped)
            return
          }
        } catch (e) {
          console.error('[admin] load orders error:', e)
        }
      }
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('storefront.orders.v1')
          const local = raw ? (JSON.parse(raw) as Order[]) : []
          if (!cancelled) setOrders(local)
        } catch {}
      }
    }
    load()
    return () => { cancelled = true }
  }, [products])

  async function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient()!
        // Prefer updating by code (unique). Older orders without code need backfill.
        const q = supabase.from('orders').update({ status }).eq('code', id)
        const { error } = await q
        if (error) console.error('[admin] setStatus error:', error)
      } catch (e) {
        console.error('[admin] setStatus exception:', e)
      }
      return
    }
    try { localStorage.setItem('storefront.orders.v1', JSON.stringify(orders.map((o) => (o.id === id ? { ...o, status } : o)))) } catch {}
  }

  async function remove(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient()!
        const { error } = await supabase.from('orders').delete().eq('code', id)
        if (error) console.error('[admin] delete order error:', error)
      } catch (e) {
        console.error('[admin] delete order exception:', e)
      }
      return
    }
    try { localStorage.setItem('storefront.orders.v1', JSON.stringify(orders.filter((o) => o.id !== id))) } catch {}
  }

  function clearAll() {
    if (isSupabaseConfigured()) {
      alert('Disabled when using Supabase to prevent accidental data loss. Delete orders individually.')
      return
    }
    setOrders([])
    try { localStorage.setItem('storefront.orders.v1', JSON.stringify([])) } catch {}
  }

  return { orders, setStatus, remove, clearAll }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin'
  const { products } = useCatalog()
  const { orders, setStatus, remove, clearAll } = useOrders(products)

  const totalSales = useMemo(() => orders.reduce((acc, o) => acc + o.total, 0), [orders])

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto card p-6 space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Enter password (default: admin)"
          className="border rounded-md px-3 py-2 w-full"
        />
        <button className="btn btn-primary w-full" onClick={() => setAuthed(pass === expected)}>Sign In</button>
        <p className="text-xs text-gray-600">For demo only. Set NEXT_PUBLIC_ADMIN_PASS to change.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-sm text-brand hover:underline">Manage Products</Link>
          <Link href="/admin/db" className="text-sm text-brand hover:underline">DB Check</Link>
          <div className="text-sm text-gray-600">Total Sales: ${totalSales.toFixed(2)}</div>
        </div>
      </header>

      <section className="card p-4">
  <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
          <button className="btn" onClick={clearAll}>Clear All</button>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Order</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Items</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Payment</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b align-top">
                    <td className="p-2">
                      <div className="font-medium">#{o.id}</div>
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{o.customer.fullName}</div>
                      <div className="text-xs text-gray-500">{o.customer.email}</div>
                      <div className="text-xs text-gray-500">{o.customer.address}, {o.customer.city}, {o.customer.country}</div>
                    </td>
                    <td className="p-2">
                      <ul className="space-y-1">
                        {o.items.map((it) => (
                          <li key={it.product.id} className="flex justify-between gap-2">
                            <span className="truncate">{it.product.name} × {it.qty}</span>
                            <span>${(it.product.price * it.qty).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 font-medium">${o.total.toFixed(2)}</td>
                    <td className="p-2">{o.payment.method.toUpperCase()}{o.payment.txid ? ` · ${o.payment.txid}` : ''}</td>
                    <td className="p-2">
                      <select
                        className="border rounded-md px-2 py-1"
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button className="btn" onClick={() => remove(o.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
