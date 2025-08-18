import { NextRequest, NextResponse } from 'next/server'
// Force Node runtime to ensure cookie-based Supabase SSR works reliably on Vercel
export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { getRequestSupabaseUser, isUserAdmin } from '@/lib/adminAuth'

const TABLE = 'inventory'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
  const user = await getRequestSupabaseUser(req as any)
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const client = getServiceClient()
    if (!client) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    const { data, error } = await client.from(TABLE).select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
  const user = await getRequestSupabaseUser(req)
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const client = getServiceClient()
    if (!client) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    const body = await req.json()
    // Basic sanitization
    const row = {
      name: String(body.name || ''),
      description: String(body.description || ''),
      price: Number(body.price || 0),
      image: String(body.image || ''),
      images: Array.isArray(body.images) ? body.images : [],
      category: String(body.category || 'misc'),
      tags: Array.isArray(body.tags) ? body.tags : [],
      active: body.active === false ? false : true,
    }
    const { data, error } = await client.from(TABLE).insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
