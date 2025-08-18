import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestSupabaseUser, isUserAdmin } from '@/lib/adminAuth'

const TABLE = 'inventory'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
  const user = await getRequestSupabaseUser(req)
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const client = getServiceClient()
    if (!client) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    const body = await req.json()
    const updates: any = {}
    for (const k of ['name','description','price','image','images','category','tags','active']) {
      if (k in body) updates[k] = body[k]
    }
    const { data, error } = await client.from(TABLE).update(updates).eq('id', params.id).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
  const user = await getRequestSupabaseUser(req)
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const client = getServiceClient()
    if (!client) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    const { error } = await client.from(TABLE).delete().eq('id', params.id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
