"use client"
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import type { Order } from '@/lib/types'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!user) return
    const u = user
    async function load() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          const { data: rows, error } = await supabase
            .from('orders')
            .select('*')
            .or(`user_id.eq.${u.id},email.eq.${u.email}`)
            .order('created_at', { ascending: false })
          if (!error && rows) {
            setOrders(rows.map((r: any) => ({
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
              items: [],
              subtotal: Number(r.subtotal || 0),
              shipping: Number(r.shipping || 0),
              total: Number(r.total || 0),
              payment: { method: String(r.payment_method || 'cod') as any, txid: r.txid || undefined },
              status: (r.status || 'pending') as any,
            })))
            return
          }
        } catch {}
      }
    }
    load()
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
          {orders.map((o) => (
            <li key={o.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-gray-600">${o.total.toFixed(2)} · {o.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
