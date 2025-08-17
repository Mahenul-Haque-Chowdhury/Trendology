import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSupabaseUser, isUserAdmin } from '@/lib/adminAuth'

const BUCKET = process.env.SUPABASE_UPLOAD_BUCKET || 'product-images'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
      const user = await getServerSupabaseUser()
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getServiceClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = String(form.get('folder') || '')
    if (!file) return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 })

    // Ensure bucket exists (idempotent)
    try {
      await supabase.storage.createBucket(BUCKET, { public: true })
    } catch {}

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const uid = (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
    const path = `${folder ? folder.replace(/\/+$/,'') + '/' : ''}${yyyy}/${mm}/${dd}/${uid}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, new Uint8Array(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 400 })

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const url = data.publicUrl
    return NextResponse.json({ ok: true, url, path, bucket: BUCKET })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if ((process.env.ADMIN_AUTH_MODE || '').toLowerCase() === 'supabase') {
      const user = await getServerSupabaseUser()
      if (!isUserAdmin(user)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getServiceClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })

    const body = await req.json()
    const path = String(body?.path || '')
    if (!path) return NextResponse.json({ ok: false, error: 'Missing path' }, { status: 400 })

    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
