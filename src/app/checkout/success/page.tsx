"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from '@/lib/cart'
import type { Order } from '@/lib/types'

export default function SuccessPage() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const name = params.get('name')
  const method = params.get('method')
  const txid = params.get('txid')
  const src = params.get('src')
  const { clear } = useCart()
  const cleared = useRef(false)
  const [order, setOrder] = useState<Order | null>(null)

  // Clear cart on success page mount once, after navigation completes
  useEffect(() => {
    if (cleared.current) return
    cleared.current = true
    clear()
  }, [clear])

  // Load the saved order (local fallback) to display a quick summary
  useEffect(() => {
    const id = orderId || undefined
    if (!id) return
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('storefront.orders.v1') : null
      const orders = raw ? (JSON.parse(raw) as Order[]) : []
      const found = orders.find((o) => o.id === id)
      if (found) setOrder(found)
    } catch {}
  }, [orderId])

  const itemCount = useMemo(() => order?.items.reduce((acc, it) => acc + it.qty, 0) ?? 0, [order])
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl">✅</div>
      <h1 className="text-3xl font-bold">Thank you{name ? `, ${name}` : ''}!</h1>
      <p className="text-gray-600">Your order {orderId ? <strong>#{orderId}</strong> : null} has been placed successfully.</p>
      {src && src !== 'server' && (
        <div className="max-w-lg mx-auto text-xs p-2 rounded bg-yellow-50 text-yellow-800">
          Note: We saved your order locally because the server didn’t confirm it. If you don’t see it in “My Orders,” please try again or contact support.
        </div>
      )}
      {method && (
        <p className="text-gray-600 text-sm">Payment Method: <strong>{method.toUpperCase()}</strong>{txid ? ` · TXID: ${txid}` : ''}</p>
      )}
      {order && (
        <div className="max-w-xl mx-auto text-left space-y-3 border rounded-md p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{itemCount}</span>
          </div>
          <ul className="divide-y text-sm">
            {order.items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center justify-between py-2">
                <span className="truncate mr-2">{product.name} × {qty}</span>
                <span>${(product.price * qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-2 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
        <Link href="/category/furniture" className="btn">Explore Furniture</Link>
      </div>
    </div>
  )
}
