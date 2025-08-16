import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    const { code } = await req.json()
    if (!code) return NextResponse.json({ ok: false, error: 'Missing order code' }, { status: 400 })
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('code', code).in('status', ['pending', 'paid'])
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
