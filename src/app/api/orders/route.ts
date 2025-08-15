import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type OrderItemInput = { product_id: string | null; qty: number; unit_price: number }
type OrderInput = {
  user_id?: string | null
  code?: string
  customer_name: string
  email: string
  phone?: string
  address: string
  city: string
  country: string
  subtotal: number
  shipping: number
  total: number
  payment_method: 'cod' | 'bkash' | 'rocket' | 'nagad'
  txid?: string | null
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  items: OrderItemInput[]
}

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, error: 'Supabase not configured on server' }, { status: 500 })
    }
    const body = (await req.json()) as Partial<OrderInput>
    // Basic validation
    const required = ['customer_name', 'email', 'address', 'city', 'country', 'subtotal', 'shipping', 'total', 'payment_method', 'status'] as const
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === '') {
        return NextResponse.json({ ok: false, error: `Missing field: ${k}` }, { status: 400 })
      }
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
    const code = body.code || ('ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase())

    const { data: orderRow, error: orderErr } = await supabase.from('orders').insert({
      user_id: body.user_id ?? null,
      code,
      customer_name: body.customer_name!,
      email: body.email!,
      address: body.address!,
      city: body.city!,
      country: body.country!,
      subtotal: Number(body.subtotal),
      shipping: Number(body.shipping),
      total: Number(body.total),
      payment_method: body.payment_method!,
      txid: body.txid ?? null,
      status: body.status!,
      // Temporary: persist phone inside admin_notes if the 'phone' column is not present in your DB
      admin_notes: body.phone ? `Phone: ${body.phone}` : undefined,
    }).select('id, code').single()
    if (orderErr || !orderRow) {
      return NextResponse.json({ ok: false, error: orderErr?.message || 'Insert failed' }, { status: 500 })
    }

    const id = orderRow.id as string
    const finalCode = orderRow.code || code

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length > 0) {
      const isUuid = (s: string | null | undefined) => !!s && /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(s)
      const payload = items.map((it) => ({
        order_id: id,
        product_id: isUuid(it.product_id) ? it.product_id : null,
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
      }))
      const { error: itemsErr } = await supabase.from('order_items').insert(payload)
      if (itemsErr) {
        // We still return success for order creation, but include items error
        return NextResponse.json({ ok: true, id, code: finalCode, itemsError: itemsErr.message })
      }
    }

    return NextResponse.json({ ok: true, id, code: finalCode })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
