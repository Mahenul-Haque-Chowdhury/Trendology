"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { useCatalog } from '@/lib/catalog'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function OrderDetailsPage() {
  const { user } = useAuth()
  const params = useParams<{ code: string }>()
  const code = decodeURIComponent(params.code)
  const { products } = useCatalog()
  const [order, setOrder] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        // Fetch order by code
        let { data: rows, error } = await supabase
          .from('orders')
          .select('*')
          .eq('code', code)
          .limit(1)
        if (error) return console.error('[order] load error:', error)
        let r = rows?.[0]
        if (!r) {
          // Fallback: if the param looks like a UUID, try by id
          const isUuid = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(code)
          if (isUuid) {
            const alt = await supabase.from('orders').select('*').eq('id', code).limit(1)
            r = alt.data?.[0]
          }
        }
        if (!r) return
        // Optionally restrict to this user by user_id or email
  if (r.user_id && r.user_id !== user.id && (r.email || '').toLowerCase() !== user.email.toLowerCase()) {
          return
        }
        const { data: itemsRows } = await supabase.from('order_items').select('*').eq('order_id', r.id)
        const items = (itemsRows || [])
          .map((ri: any) => {
            const p = products.find((p) => p.id === ri.product_id)
            return p ? { product: p, qty: ri.qty as number } : null
          })
          .filter(Boolean) as Order['items']
        const displayId = r.code || (typeof r.id === 'string' && r.id.includes('-') ? 'ORD-' + r.id.split('-').pop().toUpperCase() : String(r.id))
        setOrder({
          id: displayId,
          backendId: r.id,
          code: r.code,
          createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
          customer: { fullName: r.customer_name || '', email: r.email || '', phone: r.phone || '', address: r.address || '', city: r.city || '', country: r.country || '' },
          items,
          subtotal: Number(r.subtotal || 0),
          shipping: Number(r.shipping || 0),
          total: Number(r.total || 0),
          payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
          courier: r.courier || undefined,
          trackingNumber: r.tracking_number || undefined,
          placedAt: r.created_at ? new Date(r.created_at).getTime() : undefined,
          paidAt: r.paid_at ? new Date(r.paid_at).getTime() : undefined,
          shippedAt: r.shipped_at ? new Date(r.shipped_at).getTime() : undefined,
          deliveredAt: r.delivered_at ? new Date(r.delivered_at).getTime() : undefined,
          status: (r.status || 'pending') as any,
          created_at: r.created_at,
        })
        return
      }
      // Local fallback
      try {
        const raw = localStorage.getItem('storefront.orders.v1')
        const all = raw ? (JSON.parse(raw) as Order[]) : []
        const o = all.find((it) => it.id === code)
        if (o) setOrder(o)
      } catch {}
    }
    load()
  }, [user, code, products])

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return
    const supabase = getSupabaseClient()!
    const channel = supabase
      .channel('orders_track')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `code=eq.${code}` }, (payload: any) => {
        const r = payload.new
        setOrder((o) => o ? ({
          ...o,
          status: (r.status || o.status) as any,
          courier: r.courier || o.courier,
          trackingNumber: r.tracking_number || o.trackingNumber,
          paidAt: r.paid_at ? new Date(r.paid_at).getTime() : o.paidAt,
          shippedAt: r.shipped_at ? new Date(r.shipped_at).getTime() : o.shippedAt,
          deliveredAt: r.delivered_at ? new Date(r.delivered_at).getTime() : (o as any).deliveredAt,
        }) : o)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, code])

  const canCancel = order && !(['shipped','delivered','cancelled'] as any[]).includes(order.status)
  const steps = useMemo(() => {
    const arr: { key: string; label: string; at?: number }[] = [
      { key: 'placed', label: 'Order Placed', at: order?.placedAt || order?.createdAt },
      { key: 'paid', label: 'Payment Confirmed', at: order?.paidAt },
  { key: 'shipped', label: 'Shipped', at: order?.shippedAt },
  { key: 'delivered', label: 'Delivered', at: (order as any)?.deliveredAt },
    ]
    return arr
  }, [order])

  async function cancel() {
    if (!order || !canCancel || busy) return
    setBusy(true)
    try {
      if (order.code || order.backendId) {
        const res = await fetch('/api/orders/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: order.code, id: order.backendId }) })
        const out = await res.json()
        if (!out.ok) alert('Failed to cancel: ' + (out.error || res.statusText))
        else setOrder({ ...order, status: 'cancelled' })
      } else {
        try {
          const raw = localStorage.getItem('storefront.orders.v1')
          const all = raw ? (JSON.parse(raw) as Order[]) : []
          const next = all.map((o) => (o.id === order.id && o.status !== 'shipped' ? { ...o, status: 'cancelled' } : o))
          localStorage.setItem('storefront.orders.v1', JSON.stringify(next))
          setOrder({ ...order, status: 'cancelled' })
        } catch {}
      }
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  if (!user) return (
    <div className="max-w-md mx-auto card p-6 text-center space-y-3">
      <h1 className="text-2xl font-bold">Track Order</h1>
      <p>Please sign in to view this order.</p>
      <div className="flex gap-2 justify-center"><Link href="/account/login" className="btn btn-primary">Sign In</Link></div>
    </div>
  )

  if (!order) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-sm"><Link href="/account/orders" className="text-brand hover:underline">← Back to Orders</Link></div>
      <div className="card p-6">Order not found.</div>
    </div>
  )

  const itemCount = order.items.reduce((n, i) => n + i.qty, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm"><Link href="/account/orders" className="text-brand hover:underline">← Back to Orders</Link></div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <div className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleString()} · {itemCount} item{itemCount>1?'s':''}</div>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-1 rounded text-xs border ${order.status==='paid'?'bg-green-100 text-green-700 border-green-200':order.status==='shipped'?'bg-blue-100 text-blue-700 border-blue-200':order.status==='delivered'?'bg-emerald-100 text-emerald-700 border-emerald-200':order.status==='cancelled'?'bg-red-100 text-red-700 border-red-200':'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>{order.status[0].toUpperCase()+order.status.slice(1)}</span>
          {canCancel && <button className="btn border border-red-200 text-red-700 hover:bg-red-50 btn-sm" onClick={() => setOpen(true)} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel Order'}</button>}
        </div>
      </div>

      <section className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Order Tracking</h2>
        <Timeline steps={steps} currentStatus={order.status} />
        <div className="mt-3 text-sm text-gray-700 flex items-center justify-between">
          <div>
            {order.courier ? (
              <span>Courier: <span className="font-medium">{order.courier}</span>{order.trackingNumber ? ` · Tracking #${order.trackingNumber}` : ''}</span>
            ) : (
              <span>Courier details will appear once shipped.</span>
            )}
          </div>
          {order.trackingNumber && <a className="text-brand hover:underline" href={`https://parcelsapp.com/en/tracking/${encodeURIComponent(order.trackingNumber)}`} target="_blank" rel="noreferrer">Open tracking ↗</a>}
        </div>
      </section>

      <ConfirmDialog
        open={open}
        title="Cancel this order?"
        description="You can only cancel before it ships. This action cannot be undone."
        confirmLabel="Yes, cancel order"
        onCancel={() => setOpen(false)}
        onConfirm={cancel}
        loading={busy}
      />

      <section className="grid gap-4 grid-cols-1 lg:grid-cols-3 items-start">
        <div className="card p-4 space-y-3 lg:col-span-2">
          <h2 className="text-lg font-semibold">Items</h2>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.product.id} className="py-2 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.product.name}</div>
                  <div className="text-sm text-gray-600">Qty {it.qty} · {formatCurrencyBDT(it.product.price)} each</div>
                </div>
                <div className="font-medium">{formatCurrencyBDT(it.product.price * it.qty)}</div>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrencyBDT(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrencyBDT(order.shipping)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrencyBDT(order.total)}</span></div>
          </div>
        </div>

        <div className="card p-4 space-y-2">
          <h2 className="text-lg font-semibold">Shipping To</h2>
          <div className="text-sm">{order.customer.fullName}</div>
          <div className="text-sm text-gray-600">{order.customer.phone}</div>
          <div className="text-sm text-gray-600">{order.customer.address}, {order.customer.city}, {order.customer.country}</div>
          <div className="text-sm text-gray-600">{order.customer.email}</div>
        </div>
      </section>
    </div>
  )
}

function Timeline({ steps, currentStatus }: { steps: { key: string; label: string; at?: number }[]; currentStatus: Order['status'] }) {
  const currentIndex = steps.findIndex((s) => s.key === (currentStatus === 'pending' ? 'placed' : currentStatus))
  return (
    <ol className="relative border-s border-gray-200 ms-3">
      {steps.map((s, idx) => {
        const done = idx <= currentIndex && currentStatus !== 'cancelled'
        const cancelled = currentStatus === 'cancelled' && s.key !== 'placed'
        const dotClass = cancelled ? 'bg-red-500' : done ? 'bg-brand' : 'bg-gray-300'
        return (
          <li key={s.key} className={`mb-6 ms-6`}>
            <span className={`absolute -start-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white ${dotClass}`}></span>
            <h3 className={`font-medium leading-tight ${cancelled ? 'text-red-700' : done ? 'text-gray-900' : 'text-gray-600'}`}>{s.label}</h3>
            <p className={`text-sm ${cancelled ? 'text-red-600' : 'text-gray-500'}`}>{s.at ? new Date(s.at).toLocaleString() : (idx === 3 ? 'When delivered' : (idx>currentIndex ? 'Pending' : ''))}</p>
          </li>
        )
      })}
    </ol>
  )
}
