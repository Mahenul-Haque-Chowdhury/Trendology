"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const name = params.get('name')
  const method = params.get('method')
  const txid = params.get('txid')
  const src = params.get('src')
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
      <div className="flex items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
        <Link href="/category/furniture" className="btn">Explore Furniture</Link>
      </div>
    </div>
  )
}
