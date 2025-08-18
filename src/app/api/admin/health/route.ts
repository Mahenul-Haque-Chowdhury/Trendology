import { NextResponse } from 'next/server'
import { getServerSupabaseUser, isUserAdmin } from '@/lib/adminAuth'

export const runtime = 'nodejs'

export async function GET() {
  const mode = (process.env.ADMIN_AUTH_MODE || '').toLowerCase()
  const emails = (process.env.ADMIN_EMAILS || '')
  let user: any = null
  let admin = false
  let error: string | null = null
  try {
    if (mode === 'supabase') {
      user = await getServerSupabaseUser()
      admin = isUserAdmin(user)
    }
  } catch (e: any) {
    error = String(e?.message || e)
  }
  return NextResponse.json({
    ok: true,
    mode,
    adminEmailsConfigured: Boolean(emails.trim()),
    adminEmails: emails,
    user: user ? { id: user.id, email: user.email, role: user?.user_metadata?.role || null } : null,
    isAdmin: admin,
    env: {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    error,
  })
}
