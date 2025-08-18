"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'
import { useCatalog } from '@/lib/catalog'

export default function AdminOrderDetailsPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const code = decodeURIComponent(params.code)
  const { products } = useCatalog()
  const [order, setOrder] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)
  const [fields, setFields] = useState<{ status: OrderStatus; tracking_number?: string; courier?: string; admin_notes?: string }>({ status: 'pending' })

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        const { data: rows, error } = await supabase.from('orders').select('*').eq('code', code).limit(1)
        if (error) return console.error('[admin] load order error:', error)
        const r = rows?.[0]
        if (!r) return
        const { data: itemsRows } = await supabase.from('order_items').select('*').eq('order_id', r.id)
        const items = (itemsRows || [])
          .map((ri: any) => {
            const p = products.find((p) => p.id === ri.product_id)
            return p ? { product: p, qty: ri.qty as number } : null
          })
          .filter(Boolean) as Order['items']
        const displayId = r.code || (typeof r.id === 'string' && r.id.includes('-') ? 'ORD-' + r.id.split('-').pop().toUpperCase() : String(r.id))
        const o: Order = {
          id: displayId,
          createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
          customer: { fullName: r.customer_name || '', email: r.email || '', phone: r.phone || '', address: r.address || '', city: r.city || '', country: r.country || '' },
          items,
          subtotal: Number(r.subtotal || 0),
          shipping: Number(r.shipping || 0),
          total: Number(r.total || 0),
          payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
          paidAt: r.paid_at ? new Date(r.paid_at).getTime() : undefined,
          shippedAt: r.shipped_at ? new Date(r.shipped_at).getTime() : undefined,
          deliveredAt: r.delivered_at ? new Date(r.delivered_at).getTime() : undefined,
          status: (r.status || 'pending') as OrderStatus,
        }
        setOrder(o)
        setFields({ status: o.status, tracking_number: r.tracking_number || '', courier: r.courier || '', admin_notes: r.admin_notes || '' })
        return
      }
      // Local fallback
      try {
        const raw = localStorage.getItem('storefront.orders.v1')
        const all = raw ? (JSON.parse(raw) as Order[]) : []
        const o = all.find((it) => it.id === code)
        if (o) {
          setOrder(o)
          setFields({ status: o.status })
        }
      } catch {}
    }
    load()
  }, [code, products])

  const itemCount = useMemo(() => (order ? order.items.reduce((n, i) => n + i.qty, 0) : 0), [order])

  async function save() {
    if (!order) return
    setSaving(true)
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        const updates: any = { status: fields.status, tracking_number: fields.tracking_number || null, courier: fields.courier || null, admin_notes: fields.admin_notes || null }
        if (fields.status === 'paid' && !order.paidAt) updates.paid_at = new Date().toISOString()
        if (fields.status === 'shipped' && !order.shippedAt) updates.shipped_at = new Date().toISOString()
        if (fields.status === 'delivered' && !order.deliveredAt) updates.delivered_at = new Date().toISOString()
        const { error } = await supabase.from('orders').update(updates).eq('code', code)
        if (error) console.error('[admin] update order error:', error)
      } else {
        try {
          const raw = localStorage.getItem('storefront.orders.v1')
          const all = raw ? (JSON.parse(raw) as Order[]) : []
          const next = all.map((o) => (o.id === code ? { ...o, status: fields.status } : o))
          localStorage.setItem('storefront.orders.v1', JSON.stringify(next))
        } catch {}
      }
    } finally {
      setSaving(false)
    }
  }

  if (!order) return (
    <div className="space-y-4">
      <div className="text-sm"><Link href="/admin" className="text-brand hover:underline">← Back to Admin</Link></div>
      <div className="card p-6">Order not found.</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm"><Link href="/admin" className="text-brand hover:underline">← Back to Admin</Link></div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <div className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleString()} · {itemCount} item{itemCount>1?'s':''}</div>
        </div>
        <button className="btn" onClick={() => router.refresh()}>Refresh</button>
      </div>

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

        <div className="card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Manage</h2>
          <label className="block text-sm">Status</label>
          <select className="border rounded-md px-2 py-1 w-full" value={fields.status} onChange={(e) => setFields({ ...fields, status: e.target.value as OrderStatus })}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <label className="block text-sm">Courier</label>
          <input className="border rounded-md px-3 py-2 w-full" value={fields.courier || ''} onChange={(e) => setFields({ ...fields, courier: e.target.value })} placeholder="e.g., Pathao, Steadfast" />
          <label className="block text-sm">Tracking Number</label>
          <input className="border rounded-md px-3 py-2 w-full" value={fields.tracking_number || ''} onChange={(e) => setFields({ ...fields, tracking_number: e.target.value })} placeholder="e.g., TRK123456" />
          <label className="block text-sm">Admin Notes</label>
          <textarea className="border rounded-md px-3 py-2 w-full" value={fields.admin_notes || ''} onChange={(e) => setFields({ ...fields, admin_notes: e.target.value })} placeholder="Internal notes" />
          <button className="btn btn-primary w-full" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="text-lg font-semibold">Customer</h2>
        <div className="text-sm">{order.customer.fullName}</div>
        <div className="text-sm text-gray-600">{order.customer.email} · {order.customer.phone}</div>
        <div className="text-sm text-gray-600">{order.customer.address}, {order.customer.city}, {order.customer.country}</div>
      </section>
    </div>
  )
}
