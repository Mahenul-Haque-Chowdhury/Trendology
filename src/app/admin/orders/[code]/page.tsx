"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/lib/types'
import { useCatalog } from '@/lib/catalog'

// --- Helper Components for a cleaner UI ---

// Icon Component for visual cues
const Icon = ({ path, className = 'w-5 h-5' }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
)

// Card component for consistent styling
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <div>{children}</div>
  </div>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)

// Status Badge component with color coding
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}


// --- Main Page Component ---

export default function AdminOrderDetailsPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const code = decodeURIComponent(params.code)
  const { products } = useCatalog()
  const [order, setOrder] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)
  const [fields, setFields] = useState<{ status: OrderStatus; tracking_number?: string; courier?: string; admin_notes?: string }>({ status: 'pending' })
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient()!
        const { data: rows, error } = await supabase.from('orders').select('*').eq('code', code).limit(1)
        if (error) {
          console.error('[admin] load order error:', error)
          setIsLoading(false)
          return
        }
        const r = rows?.[0]
        if (!r) {
          setIsLoading(false)
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
          created_at: r.created_at,
        }
        setOrder(o)
        setFields({ status: o.status, tracking_number: r.tracking_number || '', courier: r.courier || '', admin_notes: r.admin_notes || '' })
      } else {
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
      setIsLoading(false)
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
        const updates: any = { 
            status: fields.status, 
            tracking_number: fields.tracking_number || null, 
            courier: fields.courier || null, 
            admin_notes: fields.admin_notes || null 
        }
        if (fields.status === 'paid' && !order.paidAt) updates.paid_at = new Date().toISOString()
        if (fields.status === 'shipped' && !order.shippedAt) updates.shipped_at = new Date().toISOString()
        if (fields.status === 'delivered' && !order.deliveredAt) updates.delivered_at = new Date().toISOString()
        const { error } = await supabase.from('orders').update(updates).eq('code', code)
        if (error) {
          console.error('[admin] update order error:', error)
          // You might want to add a user-facing error message here
        } else {
           // Optionally refresh data after save
           router.refresh()
        }
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

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading order details...</p>
    </div>
  )

  if (!order) return (
    <div className="space-y-4">
      <Link href="/admin" className="text-brand hover:underline text-sm flex items-center gap-2">
        <Icon path="M10 19a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm.707-11.707a1 1 0 0 0-1.414 0L6 10.586 7.414 12l3.293-3.293a1 1 0 0 0-1.414-1.414z" />
        Back to Admin
      </Link>
      <Card>
        <CardContent>
            <p className="text-center text-gray-700">Order not found.</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div>
        <Link href="/admin" className="text-brand hover:underline text-sm mb-2 inline-block">
          ← Back to Admin
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Order #{order.id}
              <StatusBadge status={order.status} />
            </h1>
            <div className="text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleString()} · {itemCount} item{itemCount !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="btn flex items-center gap-2" onClick={() => router.refresh()} disabled={saving}>
            <Icon path="M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
            Refresh
          </button>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* --- Left Column: Order & Customer Details --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Order Summary" />
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {order.items.map((it) => (
                  <li key={it.product.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-gray-800 truncate">{it.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {it.qty} × {formatCurrencyBDT(it.product.price)}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900">{formatCurrencyBDT(it.product.price * it.qty)}</div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-3 mt-3 text-sm space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrencyBDT(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrencyBDT(order.shipping)}</span></div>
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatCurrencyBDT(order.total)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Customer Information" />
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-gray-800">{order.customer.fullName}</p>
                <p className="text-gray-500">{order.customer.email}</p>
                <p className="text-gray-500">{order.customer.phone}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-800">Shipping Address</p>
                <p>{order.customer.address}, {order.customer.city}, {order.customer.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* --- Right Column: Management Panel --- */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Manage Order" />
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select 
                  className="border border-gray-300 rounded-md px-2 py-2 w-full focus:ring-brand focus:border-brand" 
                  value={fields.status} 
                  onChange={(e) => setFields({ ...fields, status: e.target.value as OrderStatus })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courier</label>
                <input 
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-brand focus:border-brand" 
                  value={fields.courier || ''} 
                  onChange={(e) => setFields({ ...fields, courier: e.target.value })} 
                  placeholder="e.g., Pathao, Steadfast" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input 
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-brand focus:border-brand" 
                  value={fields.tracking_number || ''} 
                  onChange={(e) => setFields({ ...fields, tracking_number: e.target.value })} 
                  placeholder="e.g., TRK123456" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea 
                  rows={3}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-brand focus:border-brand" 
                  value={fields.admin_notes || ''} 
                  onChange={(e) => setFields({ ...fields, admin_notes: e.target.value })} 
                  placeholder="Internal notes for this order" 
                />
              </div>
              <button 
                className="btn btn-primary w-full justify-center" 
                onClick={save} 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}