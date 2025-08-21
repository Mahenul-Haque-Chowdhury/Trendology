import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get a Supabase user from a Next.js request, if one is available.
// This is used in API routes to protect them.
export async function getRequestSupabaseUser(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  )
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    // A "user not found" error is normal if the user is not logged in.
    // We only want to log other, unexpected errors.
    if (!error.message.includes('user not found')) {
      console.warn('getRequestSupabaseUser error:', error)
    }
    return null
  }
  return data.user
}

// Universal admin check for both client and server
export function isUserAdmin(user: any) {
  if (!user) return false
  // Accept both user_metadata.role (Supabase user object) and role (custom user object)
  const role = (user.user_metadata?.role || (user.role ? user.role : '')).toString().toLowerCase()
  return role === 'admin'
}