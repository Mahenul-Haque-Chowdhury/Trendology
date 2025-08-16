"use client"
import { useEffect, useMemo, useState } from 'react'
import type { Order } from '@/lib/types'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useAddresses } from '@/lib/addresses'
import Link from 'next/link'
import Image from 'next/image'

type PaymentKey = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'upay'

const paymentLogos: Record<Exclude<PaymentKey, 'cod'>, { src: string; alt: string }> = {
  bkash: { src: '/logos/bkash.webp', alt: 'bKash' },
  nagad: { src: '/logos/nagad.webp', alt: 'Nagad' },
  rocket: { src: '/logos/rocket.png', alt: 'Rocket (DBBL Mobile Banking)' },
  upay: { src: '/logos/upay.webp', alt: 'Upay' },
}

function PaymentLogo({ method, size = 36 }: { method: PaymentKey; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (method === 'cod') {
    return (
      <span className="inline-flex items-center justify-center rounded bg-gray-900 text-white" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" width={Math.floor(size * 0.65)} height={Math.floor(size * 0.65)} fill="currentColor"><path d="M3 6h18v12H3z"/><path d="M16 10h.01M8 12h8M8 15h6"/></svg>
      </span>
    )
  }
  const cfg = paymentLogos[method as Exclude<PaymentKey, 'cod'>]
  return (
    <span className="inline-flex items-center justify-center rounded overflow-hidden bg-white" style={{ width: size, height: size }}>
      {failed ? (
        <span className="inline-flex items-center justify-center w-full h-full text-xs font-semibold bg-gray-100 text-gray-700">
          {cfg.alt[0]}
        </span>
      ) : (
        <Image src={cfg.src} alt={cfg.alt} width={size} height={size} className="object-contain"
          onError={() => setFailed(true)} />
      )}
    </span>
  )
}

export default function CheckoutPage() {
  const { items, total, clear, setOpen, hydrated } = useCart()
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; freeShip?: boolean } | null>(null)
  const [prefill, setPrefill] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [form, setForm] = useState<{ fullName: string; email: string; phone: string; address: string; city: string; country: string }>({ fullName: '', email: '', phone: '', address: '', city: '', country: '' })
  // Avoid instantiating the hook with undefined and let it bootstrap once user is present
  const { addresses, defaultAddress } = useAddresses(user?.id || undefined)
  const [selectedAddrId, setSelectedAddrId] = useState<string | undefined>(undefined)
  const [method, setMethod] = useState<PaymentKey>('cod')
  const [addressPrefilled, setAddressPrefilled] = useState(false)

  const subtotal = total
  const baseShipping = useMemo(() => {
    const city = (form.city || '').trim().toLowerCase()
    if (!city) return 130
    return city.includes('dhaka') ? 70 : 130
  }, [form.city])
  const shipping = appliedCoupon?.freeShip ? 0 : baseShipping
  const discount = appliedCoupon?.discount ?? 0
  const grandTotal = Math.max(0, subtotal + shipping - discount)

  function validateCoupon(codeRaw: string) {
    const code = codeRaw.trim().toUpperCase()
    if (!code) return null as null | { code: string; discount: number; freeShip?: boolean }
    // Simple demo rules; replace with server validation if needed
    const rules: Record<string, { type: 'percent' | 'fixed' | 'freeship'; value?: number; min?: number }> = {
      SAVE10: { type: 'percent', value: 10, min: 50 }, // 10% off orders >= $50
      WELCOME5: { type: 'fixed', value: 5, min: 20 }, // $5 off orders >= $20
      FREESHIP: { type: 'freeship' }, // Free shipping
    }
    const rule = rules[code]
    if (!rule) return null
    const minOk = (rule.min ?? 0) <= subtotal
    if (!minOk) return null
    if (rule.type === 'freeship') return { code, discount: 0, freeShip: true }
    if (rule.type === 'fixed') return { code, discount: Math.min(subtotal, Math.max(0, rule.value || 0)) }
    if (rule.type === 'percent') return { code, discount: Math.min(subtotal, (Math.max(0, rule.value || 0) / 100) * subtotal) }
    return null
  }

  function onApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    const res = validateCoupon(couponInput)
    setAppliedCoupon(res)
  }

  useEffect(() => {
    if (!user) return
    const u = user
    if (!isSupabaseConfigured()) {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(`storefront.user_details.${u.id}`) : null
        if (raw) {
          const cached = JSON.parse(raw)
          setPrefill({ name: cached.name || u.name, email: cached.email || u.email, phone: cached.phone || '' })
          return
        }
      } catch {}
    }
    // In Supabase mode, use auth session’s user for basic fields; no table reads.
    setPrefill({ name: u.name, email: u.email })
  }, [user])

  // Initialize form fields when prefill data arrives
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: prefill.name ?? prev.fullName,
      email: prefill.email ?? prev.email,
      phone: prefill.phone ?? prev.phone,
    }))
  }, [prefill])

  // Select a default address automatically
  useEffect(() => {
    if (!selectedAddrId && defaultAddress?.id) setSelectedAddrId(defaultAddress.id)
  }, [defaultAddress?.id, selectedAddrId])

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

  // Prefill from Supabase addresses on first load (default first)
  useEffect(() => {
    if (addressPrefilled) return
    if (!addresses.length) return
    const a = defaultAddress || addresses[0]
    if (!a) return
    setSelectedAddrId(a.id)
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || a.recipient || prev.fullName,
      phone: a.phone || prev.phone,
      address: a.address_line || prev.address,
      city: a.city || prev.city,
      country: a.country || prev.country,
    }))
    setAddressPrefilled(true)
  }, [addresses, defaultAddress, addressPrefilled])

  // If user just added an address, prefill from the checkout prefill cache (demo/local only)
  useEffect(() => {
    if (!user?.id) return
    if (isSupabaseConfigured()) return
    try {
      const key = `storefront.checkout.prefill.${user.id}`
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (!raw) return
      const a = JSON.parse(raw)
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || a.recipient || prev.fullName,
        phone: a.phone || prev.phone,
        address: a.address_line || prev.address,
        city: a.city || prev.city,
        country: a.country || prev.country,
      }))
      // Also try to select it in the dropdown when it exists
      const found = addresses.find(it => it.id === a.id)
      if (found?.id) setSelectedAddrId(found.id)
    } catch {}
  }, [user?.id, addresses])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
  setIsSubmitting(true)
    if (items.length === 0) return router.push('/')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('fullName') || '')
  const paymentMethod = String(formData.get('paymentMethod') || 'cod') as typeof method
  const phone = String(formData.get('phone') || '')
    const txid = String(formData.get('txid') || '')
    // Human-friendly short order code (fallback if server doesn't return one)
    let orderCode = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    // Prefer server API with service role to guarantee insert under strict RLS
    let serverOk = false
    try {
      // We still try to include a user_id if available from Supabase client
      let supaUserId: string | null = null
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient()!
          const { data } = await supabase.auth.getUser()
          supaUserId = data.user?.id ?? null
        } catch {}
      }
      const isUuid = (s: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(s)
      const payload = {
        user_id: supaUserId ?? user?.id ?? null,
        code: orderCode,
        customer_name: String(formData.get('fullName') || ''),
        email: user?.email || String(formData.get('email') || ''),
        phone,
        address: String(formData.get('address') || ''),
        city: String(formData.get('city') || ''),
        country: String(formData.get('country') || ''),
        subtotal,
        shipping,
        total: subtotal + shipping - discount,
        coupon_code: appliedCoupon?.code || undefined,
        discount: discount > 0 ? discount : undefined,
        payment_method: paymentMethod,
        txid: txid || null,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        items: items.map((it) => ({
          product_id: isUuid(String(it.product.id)) ? String(it.product.id) : null,
          qty: it.qty,
          unit_price: it.product.price,
        })),
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null as any)
      if (res.ok && data?.ok) {
        serverOk = true
        if (data.code) orderCode = data.code
      } else {
        console.error('[checkout] Server order create failed:', data?.error || res.statusText)
      }
    } catch (err) {
      console.error('[checkout] Server API error:', err)
    }
    // Fallback: try client Supabase insert if server failed but Supabase is configured
    if (!serverOk && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient()!
        let supaUserId: string | null = null
        try {
          const { data } = await supabase.auth.getUser()
          supaUserId = data.user?.id ?? null
        } catch {}
        const orderIdDb = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
          ? (crypto as any).randomUUID()
          : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0')
        const { error: orderErr } = await supabase.from('orders').insert({
          id: orderIdDb,
          user_id: supaUserId ?? user?.id ?? null,
          code: orderCode,
          customer_name: String(formData.get('fullName') || ''),
          email: user?.email || String(formData.get('email') || ''),
          address: String(formData.get('address') || ''),
          city: String(formData.get('city') || ''),
          country: String(formData.get('country') || ''),
          subtotal,
          shipping,
          total: subtotal + shipping - discount,
          payment_method: paymentMethod,
          txid: txid || null,
          status: paymentMethod === 'cod' ? 'pending' : 'paid',
        })
        if (orderErr) {
          console.error('[checkout] Supabase order insert error:', orderErr)
        } else {
          const isUuid = (s: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(s)
          const itemsPayload = items.map((it) => ({
            order_id: orderIdDb,
            product_id: isUuid(String(it.product.id)) ? String(it.product.id) : null,
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
        id: orderCode,
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
        discount: discount > 0 ? discount : 0,
        couponCode: appliedCoupon?.code,
        total: subtotal + shipping - discount,
        payment: { method: paymentMethod, txid: txid || undefined },
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
      }
      const raw = typeof window !== 'undefined' ? localStorage.getItem('storefront.orders.v1') : null
      const orders = raw ? (JSON.parse(raw) as Order[]) : []
      orders.unshift(order)
      if (typeof window !== 'undefined') localStorage.setItem('storefront.orders.v1', JSON.stringify(orders))
    } catch {}
  const source = serverOk ? 'server' : (isSupabaseConfigured() ? 'client' : 'local')
  const params = new URLSearchParams({ orderId: orderCode, name, method: paymentMethod, txid, src: source })
    router.push(`/checkout/success?${params.toString()}`)
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-gray-600 text-sm">Loading your cart…</p>
      </div>
    )
  }

  if (!isSubmitting && items.length === 0) {
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

          <fieldset className="space-y-3" role="radiogroup" aria-label="Payment Method">
            <legend className="text-sm font-medium">Payment Method</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'cod', label: 'Cash on Delivery' },
                { key: 'bkash', label: 'bKash' },
                { key: 'nagad', label: 'Nagad' },
                { key: 'rocket', label: 'Rocket' },
                { key: 'upay', label: 'Upay' },
              ] as { key: PaymentKey; label: string }[]).map((m) => (
                <label
                  key={m.key}
                  className={`group flex items-center gap-3.5 rounded-lg border p-3.5 sm:p-3 min-h-[60px] cursor-pointer transition shadow-sm hover:shadow ${method === m.key ? 'border-brand ring-2 ring-brand/40' : 'border-gray-200'}`}
                  role="radio"
                  aria-checked={method === m.key}
                >
                  <input className="sr-only" type="radio" name="paymentMethod" value={m.key}
                    checked={method === m.key} onChange={() => setMethod(m.key)} />
                  <PaymentLogo method={m.key} />
                  <div className="min-w-0">
                    <div className="font-medium leading-tight">{m.label}</div>
                    <p className="text-xs text-gray-600">{m.key === 'cod' ? 'Pay in cash when your order arrives.' : 'Send payment and enter the Transaction ID below.'}</p>
                  </div>
                </label>
              ))}
            </div>
            {/* Details dropdown for the selected method */}
            <div className="overflow-hidden transition-[max-height] duration-300" style={{ maxHeight: method === 'cod' ? '110px' : '260px' }}>
              <div className="mt-1.5 rounded-md border bg-white/50 p-3 text-sm">
                {method === 'cod' ? (
                  <div className="flex items-start gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700" fill="none" stroke="currentColor"><path d="M3 6h18v12H3z"/><path d="M16 10h.01M8 12h8M8 15h6"/></svg>
                    <p className="text-gray-700">Please keep the exact amount ready. Our delivery agent will collect payment upon delivery.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PaymentLogo method={method} size={24} />
                        <div className="font-medium">{method === 'bkash' ? 'bKash' : method === 'nagad' ? 'Nagad' : method === 'rocket' ? 'Rocket' : 'Upay'} payment details</div>
                      </div>
                      <ul className="text-gray-700 list-disc list-inside text-xs space-y-1">
                        <li>Send to: 01XXXXXXXXX</li>
                        <li>Reference: Your mobile number</li>
                        <li>Amount: ${grandTotal.toFixed(2)}</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium">Transaction ID</label>
                      <input name="txid" required className="border rounded-md px-3 py-2 w-full" placeholder="e.g., TX123ABC456" inputMode="text" />
                      <p className="text-[11px] text-gray-500">We’ll verify and confirm your order by SMS/phone.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Transaction ID input moved into details dropdown above for online methods */}

          <div className="flex items-center gap-2">
            <input id="terms" type="checkbox" required />
            <label htmlFor="terms" className="text-sm">I agree to the terms and privacy policy.</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </form>
      </section>

      <aside className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <button type="button" className="text-sm text-brand hover:underline" onClick={() => setOpen(true)}>Edit</button>
        </div>
        <div className="rounded-md border bg-white/50">
          <ul className="max-h-64 overflow-auto divide-y">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 p-3 text-sm">
                {product.image ? (
                  <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-gray-100">
                    <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">Qty: {qty} · ${product.price.toFixed(2)} each</div>
                </div>
                <div className="font-medium">${(product.price * qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Coupon input inside the summary box */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Have a coupon?</label>
          <div className="flex items-center gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="e.g., SAVE10, FREESHIP"
              className="border rounded-md px-3 py-2 w-full"
            />
            <button className="btn btn-sm btn-primary" onClick={onApplyCoupon} type="button">Apply</button>
          </div>
          {appliedCoupon ? (
            <p className="text-xs text-green-700">
              Applied {appliedCoupon.code}
              {appliedCoupon.discount > 0 ? ` · −$${appliedCoupon.discount.toFixed(2)}` : ''}
              {appliedCoupon.freeShip ? ' · Free Shipping' : ''}
              <button
                type="button"
                onClick={() => setAppliedCoupon(null)}
                className="ml-2 underline text-green-700/90 hover:text-green-800"
              >
                Remove
              </button>
            </p>
          ) : (
            couponInput.trim() ? <p className="text-xs text-gray-500">Enter a valid code and click Apply.</p> : null
          )}
        </div>
        <div className="rounded-md bg-gray-50 border p-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700"><span>Discount{appliedCoupon?.code ? ` (${appliedCoupon.code})` : ''}</span><span>- ${discount.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
          <p className="text-xs text-gray-500">Shipping: Inside Dhaka $70.00 · Outside Dhaka $130.00. Applying FREESHIP will waive shipping.</p>
        </div>
      </aside>
    </div>
  )
}
