"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { useCatalog } from '@/lib/catalog'
import { formatCurrencyBDT } from '@/lib/currency'

function ReorderButton({ order }: { order: Order }) {
  const [busy, setBusy] = useState(false)
  const { add, setOpen } = require('@/lib/cart').useCart()
  const { push } = require('@/components/ToastStack').useToast()
  async function reorder() {
    if (busy) return
    setBusy(true)
    try {
      for (const it of order.items) add(it.product, it.qty || 1, { openDrawer: false })
      push({ title: 'Items Added', message: 'Cancelled order items added to cart.', variant: 'success', actionLabel: 'Open Cart', onAction: () => setOpen(true), duration: 5000 })
    } finally { setBusy(false) }
  }
  return <button className="btn btn-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50" disabled={busy} onClick={reorder}>{busy ? 'Adding…' : 'Reorder'}</button>
}

export default function CancellationsPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const { products } = useCatalog()
  useEffect(() => {
    if (!user) return
    async function load() {
      if (!user) return
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          const res = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'cancelled')
            .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
            .order('created_at', { ascending: false })
          const rows: any[] | null = res.data
          if (rows && rows.length) {
            const ids = rows.map(r => r.id)
            const { data: itemRows } = await supabase.from('order_items').select('*').in('order_id', ids)
            const itemsByOrder = new Map<string, any[]>()
            for (const it of itemRows || []) {
              const arr = itemsByOrder.get(it.order_id) || []
              arr.push(it)
              itemsByOrder.set(it.order_id, arr)
            }
            setOrders(rows.map(r => {
              const mapped = (itemsByOrder.get(r.id) || []).map(ir => {
                const p = products.find(p => p.id === ir.product_id)
                return p ? { product: p, qty: ir.qty } : null
              }).filter(Boolean) as Order['items']
              return {
                id: r.code || r.id,
                backendId: r.id,
                code: r.code,
                createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
                customer: { fullName: r.customer_name || '', email: r.email || '', phone: '', address: r.address || '', city: r.city || '', country: r.country || '' },
                items: mapped,
                subtotal: Number(r.subtotal || 0),
                shipping: Number(r.shipping || 0),
                total: Number(r.total || 0),
                payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
                status: 'cancelled',
                created_at: r.created_at,
              } as Order
            }))
            return
          }
        } catch {}
      }
      // Local fallback
      try {
        const raw = localStorage.getItem('storefront.orders.v1')
        const local = raw ? (JSON.parse(raw) as Order[]) : []
        setOrders(local.filter(o => o.status === 'cancelled'))
      } catch {}
    }
    load()
  }, [user, products])
  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">My Cancellations</h1>
        <p>Please sign in to view or request a cancellation.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-3xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Cancellations ({orders.length})</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600 text-sm">No cancelled orders.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map(o => {
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
                      <span>{itemCount} item{itemCount>1?'s':''}{first?` · ${first}${itemCount>1?' +'+(itemCount-1):''}`:''}</span>
                    ) : <span>No items</span>}
                  </div>
                  <span className="font-medium">{formatCurrencyBDT(o.total)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <ReorderButton order={o} />
                  <Link href={`/account/orders/${encodeURIComponent(o.code || o.backendId || o.id)}`} className="btn btn-xs">View</Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
