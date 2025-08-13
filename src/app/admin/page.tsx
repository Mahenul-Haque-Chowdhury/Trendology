"use client"
import { useEffect, useMemo, useState } from 'react'
import type { Order, OrderStatus } from '@/lib/types'

function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('storefront.orders.v1')
      if (raw) setOrders(JSON.parse(raw))
    } catch {}
  }, [])

  function save(next: Order[]) {
    setOrders(next)
    try { localStorage.setItem('storefront.orders.v1', JSON.stringify(next)) } catch {}
  }

  return {
    orders,
    setStatus(id: string, status: OrderStatus) {
      const next = orders.map((o) => (o.id === id ? { ...o, status } : o))
      save(next)
    },
    remove(id: string) {
      const next = orders.filter((o) => o.id !== id)
      save(next)
    },
    clearAll() {
      save([])
    }
  }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin'
  const { orders, setStatus, remove, clearAll } = useOrders()

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
        <div className="text-sm text-gray-600">Total Sales: ${totalSales.toFixed(2)}</div>
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
