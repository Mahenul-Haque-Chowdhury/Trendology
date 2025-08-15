import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  const res: any = {
    configured: Boolean(url && (anon || service)),
    urlPresent: Boolean(url),
    anonKeyPresent: Boolean(anon),
    serviceKeyPresent: Boolean(service),
    canSelectOrders: false,
    using: service ? 'service' : (anon ? 'anon' : 'none'),
  }

  if (!url || !(anon || service)) {
    return NextResponse.json(res)
  }

  try {
    const supabase = createClient(url, service || anon!, { auth: { persistSession: false } })
    const r = await supabase.from('orders').select('*', { head: true, count: 'exact' }).limit(1)
    if (!r.error) {
      res.canSelectOrders = true
      res.ordersCountHint = r.count ?? null
    } else {
      res.canSelectOrders = false
      res.selectError = r.error.message
    }
  } catch (e: any) {
    res.error = String(e?.message || e)
  }

  return NextResponse.json(res)
}
