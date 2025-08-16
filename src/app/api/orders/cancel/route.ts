import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
  const { code, id } = await req.json()
  if (!code && !id) return NextResponse.json({ ok: false, error: 'Missing order identifier' }, { status: 400 })
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
  let q = supabase.from('orders').update({ status: 'cancelled' }).in('status', ['pending', 'paid'])
  if (code) q = q.eq('code', code)
  else if (id) q = q.eq('id', id)
  const { error } = await q
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
