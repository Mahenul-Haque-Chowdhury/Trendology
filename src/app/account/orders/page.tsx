"use client"
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import type { Order } from '@/lib/types'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useCatalog } from '@/lib/catalog'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const { products } = useCatalog()

  useEffect(() => {
    if (!user) return
    const u = user
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          // Fetch by user_id OR case-insensitive email in one query
          const res = await supabase
            .from('orders')
            .select('*')
            .or(`user_id.eq.${u.id},email.ilike.${u.email}`)
            .order('created_at', { ascending: false })
          const rows: any[] | null = res.data
          const error: any = res.error
          if (!error && rows && rows.length > 0) {
            // Fetch order items for these orders
            const orderIds = rows.map((r: any) => r.id)
            const { data: itemsRows } = await supabase
              .from('order_items')
              .select('*')
              .in('order_id', orderIds)

            const itemsByOrder = new Map<string, { product_id: string | null; qty: number; unit_price: number }[]>()
            for (const it of itemsRows || []) {
              const arr = itemsByOrder.get(it.order_id) || []
              arr.push({ product_id: it.product_id, qty: it.qty, unit_price: Number(it.unit_price) })
              itemsByOrder.set(it.order_id, arr)
            }

            setOrders(
              rows.map((r: any) => {
                const rawItems = itemsByOrder.get(r.id) || []
                const mapped = rawItems
                  .map((ri) => {
                    const p = products.find((p) => p.id === ri.product_id)
                    if (!p) return null
                    return { product: p, qty: ri.qty }
                  })
                  .filter(Boolean) as Order['items']
                // Prefer human code; else fallback to short suffix of UUID
                const displayId: string = r.code || (typeof r.id === 'string' && r.id.includes('-')
                  ? 'ORD-' + r.id.split('-').pop().toUpperCase()
                  : String(r.id))
                return {
                  id: displayId,
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
                  items: mapped,
                  subtotal: Number(r.subtotal || 0),
                  shipping: Number(r.shipping || 0),
                  total: Number(r.total || 0),
                  payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
                  courier: r.courier || undefined,
                  trackingNumber: r.tracking_number || undefined,
                  placedAt: r.created_at ? new Date(r.created_at).getTime() : undefined,
                  paidAt: r.paid_at ? new Date(r.paid_at).getTime() : undefined,
                  shippedAt: r.shipped_at ? new Date(r.shipped_at).getTime() : undefined,
                  status: (r.status || 'pending') as any,
                } as Order
              })
            )
            return
          }
        } catch {}
      }
      // Fallback to local orders
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('storefront.orders.v1') : null
        const localOrders = raw ? (JSON.parse(raw) as Order[]) : []
        setOrders(localOrders)
      } catch {}
    }
    load()
  }, [user, products])

  // Live updates for status and totals
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return
    const supabase = getSupabaseClient()!
    const channel = supabase
      .channel('orders_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload: any) => {
        const r = payload.new
        setOrders((prev) => prev.map((o) => {
          const isSame = o.backendId === r?.id || o.id === r?.code || o.id.endsWith(String((r?.code || '').split('-').pop()).toUpperCase())
          if (!isSame) return o
          return {
            ...o,
            total: Number(r.total ?? o.total),
            status: (r.status || o.status) as any,
            courier: r.courier || o.courier,
            trackingNumber: r.tracking_number || o.trackingNumber,
            paidAt: r.paid_at ? new Date(r.paid_at).getTime() : o.paidAt,
            shippedAt: r.shipped_at ? new Date(r.shipped_at).getTime() : o.shippedAt,
          }
        }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p>Please sign in to view your orders.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Orders ({orders.length})</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const itemCount = o.items.reduce((n, it) => n + it.qty, 0)
            const first = o.items[0]?.product?.name
            return (
              <li key={o.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Order #{o.id}</div>
                  <div className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <div className="truncate">
                    {itemCount > 0 ? (
                      <span>{itemCount} item{itemCount > 1 ? 's' : ''}{first ? ` · ${first}${itemCount > 1 ? ' +' + (itemCount - 1) : ''}` : ''}</span>
                    ) : (
                      <span>No items</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${o.total.toFixed(2)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <div className="flex gap-2">
                    <Link href={`/account/orders/${encodeURIComponent(o.code || o.backendId || o.id)}`} className="btn btn-primary btn-xs">Track</Link>
                    {o.status !== 'shipped' && o.status !== 'cancelled' && (
                      <CancelButton order={o} onCancelled={(id) => setOrders((prev) => prev.map((it) => it.id === id ? { ...it, status: 'cancelled' } : it))} />
                    )}
                  </div>
                  {o.trackingNumber && <div className="text-gray-600">Tracking: {o.trackingNumber}</div>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const color =
    status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
    status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
    'bg-yellow-100 text-yellow-800 border-yellow-200'
  const label = status[0].toUpperCase() + status.slice(1)
  return <span className={`border px-2 py-0.5 rounded text-xs ${color}`}>{label}</span>
}

function CancelButton({ order, onCancelled }: { order: Order; onCancelled: (id: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  async function cancel() {
    if (busy) return
    setBusy(true)
    try {
      if (order.code) {
        const res = await fetch('/api/orders/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: order.code }) })
        const out = await res.json()
        if (!out.ok) alert('Failed to cancel: ' + (out.error || res.statusText))
        else onCancelled(order.id)
      } else {
        // Local fallback
        try {
          const raw = localStorage.getItem('storefront.orders.v1')
          const all = raw ? (JSON.parse(raw) as Order[]) : []
          const next = all.map((o) => (o.id === order.id && o.status !== 'shipped' ? { ...o, status: 'cancelled' } : o))
          localStorage.setItem('storefront.orders.v1', JSON.stringify(next))
          onCancelled(order.id)
        } catch {}
      }
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }
  return (
    <>
      <button className="btn border border-red-200 text-red-700 hover:bg-red-50 btn-xs" onClick={() => setOpen(true)} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel'}</button>
      <ConfirmDialog
        open={open}
        title="Cancel this order?"
        description="You can only cancel before it ships. This action cannot be undone."
        confirmLabel="Yes, cancel order"
        onCancel={() => setOpen(false)}
        onConfirm={cancel}
        loading={busy}
      />
    </>
  )
}
