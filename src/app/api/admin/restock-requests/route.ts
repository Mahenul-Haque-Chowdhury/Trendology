import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRequestSupabaseUser, isUserAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'

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
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product_id')
    if (!productId) return NextResponse.json({ ok: false, error: 'Missing product_id' }, { status: 400 })
    const client = getServiceClient()
    if (!client) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
    // Fetch restock requests and join auth.users for email
    const { data, error } = await client
      .from('restock_requests')
      .select('id, created_at, user_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    // Get user emails in batch (auth.users accessible with service key)
    const userIds = Array.from(new Set((data || []).map(r => r.user_id)))
    let emails: Record<string, { email: string | null }> = {}
    if (userIds.length) {
      const { data: users, error: uErr } = await client.from('profiles').select('id, email').in('id', userIds)
      if (!uErr && users) {
        for (const u of users) emails[u.id as string] = { email: (u as any).email }
      }
    }
    const items = (data || []).map(r => ({
      id: r.id,
      created_at: r.created_at,
      user_id: r.user_id,
      email: emails[r.user_id]?.email || null,
    }))
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
