"use client"
import { useEffect, useMemo, useState } from 'react'
import type { Order } from '@/lib/types'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useAddresses } from '@/lib/addresses'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const router = useRouter()
  const { user } = useAuth()
  const [prefill, setPrefill] = useState<{ name?: string; email?: string; phone?: string; address?: string; city?: string; country?: string }>({})
  const [form, setForm] = useState<{ fullName: string; email: string; phone: string; address: string; city: string; country: string }>({ fullName: '', email: '', phone: '', address: '', city: '', country: '' })
  const { addresses, defaultAddress } = useAddresses(user?.id)
  const [selectedAddrId, setSelectedAddrId] = useState<string | undefined>(undefined)
  const [method, setMethod] = useState<'cod' | 'bkash' | 'rocket' | 'nagad'>('cod')

  const subtotal = total
  const shipping = useMemo(() => (subtotal > 250 ? 0 : 12), [subtotal])
  const grandTotal = subtotal + shipping

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const u = user
      if (!isSupabaseConfigured()) {
        // try local cache first
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem(`storefront.user_details.${u.id}`) : null
          if (raw) {
            const cached = JSON.parse(raw)
            setPrefill({ name: cached.name || u.name, email: cached.email || u.email, phone: cached.phone || '', address: cached.address || '', city: cached.city || '', country: cached.country || '' })
            return
          }
        } catch {}
        setPrefill({ name: u.name, email: u.email })
        return
      }
      try {
        const supa = getSupabaseClient()!
        async function getFrom(table: string) {
          return await supa.from(table).select('name,email,phone,address,city,country').eq('id', u.id).maybeSingle()
        }
        let r = await getFrom('user_details')
        if (r.error) r = await getFrom('profiles')
    const data = r.data
  if (data) setPrefill({ name: data.name || u.name, email: data.email || u.email, phone: data.phone || '', address: data.address || '', city: data.city || '', country: data.country || '' })
  else setPrefill({ name: u.name, email: u.email, phone: '' })
      } catch {}
    }
    loadProfile()
  }, [user])

  // Initialize form fields when prefill data arrives
  useEffect(() => {
    setForm({
      fullName: prefill.name || '',
      email: prefill.email || '',
      phone: prefill.phone || '',
      address: prefill.address || '',
      city: prefill.city || '',
      country: prefill.country || '',
    })
  }, [prefill])

  // Select a default address automatically
  useEffect(() => {
    if (!selectedAddrId && defaultAddress?.id) setSelectedAddrId(defaultAddress.id)
  }, [defaultAddress, selectedAddrId])

  // When an address is selected, copy its fields into the form
  useEffect(() => {
    if (!selectedAddrId) return
    const a = addresses.find(it => it.id === selectedAddrId)
    if (!a) return
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || a.recipient || prev.fullName,
      phone: a.phone || prev.phone,
      address: a.address_line || prev.address,
      city: a.city || prev.city,
      country: a.country || prev.country,
    }))
  }, [selectedAddrId, addresses])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return router.push('/')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('fullName') || '')
  const paymentMethod = String(formData.get('paymentMethod') || 'cod') as typeof method
  const phone = String(formData.get('phone') || '')
    const txid = String(formData.get('txid') || '')
    // Mock order id
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase()
    // If Supabase is configured, save order in DB (authenticated user recommended)
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient()!
        const orderIdDb = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0')
    const { error: orderErr } = await supabase
          .from('orders')
          .insert({
            id: orderIdDb,
            user_id: user?.id ?? null,
            customer_name: String(formData.get('fullName') || ''),
            email: String(formData.get('email') || ''),
      phone,
            address: String(formData.get('address') || ''),
            city: String(formData.get('city') || ''),
            country: String(formData.get('country') || ''),
            subtotal,
            shipping,
            total: subtotal + shipping,
            payment_method: paymentMethod,
            txid: txid || null,
            status: paymentMethod === 'cod' ? 'pending' : 'paid',
          })
        if (orderErr) {
          console.error('[checkout] Supabase order insert error:', orderErr)
        } else {
          console.debug('[checkout] Supabase order created:', orderIdDb)
          const isUuid = (s: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(s)
          const itemsPayload = items.map((it) => ({
            order_id: orderIdDb,
            product_id: isUuid(it.product.id) ? it.product.id : null,
            qty: it.qty,
            unit_price: it.product.price,
          }))
          const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload)
          if (itemsErr) console.error('[checkout] order_items insert error:', itemsErr)
        }
      } catch (err) {
        console.error('[checkout] Supabase error:', err)
      }
    }
    try {
      const order: Order = {
        id: orderId,
        createdAt: Date.now(),
        customer: {
          fullName: String(formData.get('fullName') || ''),
          email: String(formData.get('email') || ''),
          phone,
          address: String(formData.get('address') || ''),
          city: String(formData.get('city') || ''),
          country: String(formData.get('country') || ''),
        },
        items: items.map((it) => ({ product: it.product, qty: it.qty })),
        subtotal,
        shipping,
        total: subtotal + shipping,
        payment: { method: paymentMethod, txid: txid || undefined },
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      }
      const raw = typeof window !== 'undefined' ? localStorage.getItem('storefront.orders.v1') : null
      const orders = raw ? (JSON.parse(raw) as Order[]) : []
      orders.unshift(order)
      if (typeof window !== 'undefined') localStorage.setItem('storefront.orders.v1', JSON.stringify(orders))
    } catch {}
    clear()
    const params = new URLSearchParams({ orderId, name, method: paymentMethod, txid })
    router.push(`/checkout/success?${params.toString()}`)
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/" className="btn btn-primary w-max">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
      <section className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <form className="space-y-6" onSubmit={onSubmit}>
          {addresses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Select a saved address</label>
                <Link href="/account/address" className="text-sm text-brand hover:underline">Manage</Link>
              </div>
              <select className="border rounded-md px-3 py-2 w-full" value={selectedAddrId || ''} onChange={(e) => setSelectedAddrId(e.target.value || undefined)}>
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>
                    {(a.label || 'Address') + (a.city ? ` · ${a.city}` : '')}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Full Name</label>
              <input name="fullName" required className="border rounded-md px-3 py-2 w-full" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Email</label>
              <input name="email" type="email" required className="border rounded-md px-3 py-2 w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Mobile Number</label>
              <input name="phone" type="tel" required className="border rounded-md px-3 py-2 w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-sm font-medium">Address</label>
              <input name="address" required className="border rounded-md px-3 py-2 w-full" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">City</label>
              <input name="city" required className="border rounded-md px-3 py-2 w-full" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Country</label>
              <input name="country" required className="border rounded-md px-3 py-2 w-full" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Payment Method</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={`border rounded-md p-3 cursor-pointer ${method === 'cod' ? 'border-brand' : 'border-gray-200'}`}>
                <input className="sr-only" type="radio" name="paymentMethod" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                <div className="font-medium">Cash on Delivery</div>
                <p className="text-sm text-gray-600">Pay with cash when the order arrives at your doorstep.</p>
              </label>

              <label className={`border rounded-md p-3 cursor-pointer ${method === 'bkash' ? 'border-brand' : 'border-gray-200'}`}>
                <input className="sr-only" type="radio" name="paymentMethod" value="bkash" checked={method === 'bkash'} onChange={() => setMethod('bkash')} />
                <div className="font-medium">bKash</div>
                <p className="text-sm text-gray-600">Send payment to bKash: 01XXXXXXXXX. Enter your Transaction ID below.</p>
              </label>

              <label className={`border rounded-md p-3 cursor-pointer ${method === 'rocket' ? 'border-brand' : 'border-gray-200'}`}>
                <input className="sr-only" type="radio" name="paymentMethod" value="rocket" checked={method === 'rocket'} onChange={() => setMethod('rocket')} />
                <div className="font-medium">Rocket</div>
                <p className="text-sm text-gray-600">Send payment to Rocket: 01XXXXXXXXX. Enter your Transaction ID below.</p>
              </label>

              <label className={`border rounded-md p-3 cursor-pointer ${method === 'nagad' ? 'border-brand' : 'border-gray-200'}`}>
                <input className="sr-only" type="radio" name="paymentMethod" value="nagad" checked={method === 'nagad'} onChange={() => setMethod('nagad')} />
                <div className="font-medium">Nagad</div>
                <p className="text-sm text-gray-600">Send payment to Nagad: 01XXXXXXXXX. Enter your Transaction ID below.</p>
              </label>
            </div>
          </fieldset>

          {(method === 'bkash' || method === 'rocket' || method === 'nagad') && (
            <div className="space-y-1">
              <label className="block text-sm font-medium">Transaction ID</label>
              <input name="txid" required className="border rounded-md px-3 py-2 w-full" placeholder="e.g., TX123ABC456" />
              <p className="text-xs text-gray-500">We will verify your payment and confirm the order by phone/SMS.</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input id="terms" type="checkbox" required />
            <label htmlFor="terms" className="text-sm">I agree to the terms and privacy policy.</label>
          </div>

          <button type="submit" className="btn btn-primary">Place Order</button>
        </form>
      </section>

      <aside className="card p-4 space-y-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <ul className="space-y-2">
          {items.map(({ product, qty }) => (
            <li key={product.id} className="flex items-center justify-between text-sm">
              <span className="truncate mr-2">{product.name} × {qty}</span>
              <span>${(product.price * qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-2 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  )
}
