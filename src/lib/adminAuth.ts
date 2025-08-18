import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getServerSupabaseUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  // Use cookie-based auth for server components & routes
  const cookieStore = cookies()
  const supabase = createServerClient(url, anon, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => {
        try { cookieStore.set(name, value, options) } catch {}
      },
      remove: (name: string, options: any) => {
        try { cookieStore.set(name, '', { ...options, maxAge: 0 }) } catch {}
      },
    },
  } as any)
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export function isUserAdmin(user: any) {
  if (!user) return false
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  const email = String(user.email || '').toLowerCase()
  if (adminEmails.length > 0 && adminEmails.includes(email)) return true
  // Optional role flag in user metadata
  const role = (user.user_metadata?.role || '').toString().toLowerCase()
  return role === 'admin'
}
