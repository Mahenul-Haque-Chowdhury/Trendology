import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// HMR-safe global cache to avoid creating multiple clients in the same browser context.
const globalForSupabase = globalThis as unknown as { __trendology_supabase?: SupabaseClient; __aamardokan_supabase?: SupabaseClient }
let cachedClient: SupabaseClient | null = globalForSupabase.__trendology_supabase ?? globalForSupabase.__aamardokan_supabase ?? null

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  if (cachedClient) return cachedClient

  const client = createClient(url, key, {
    auth: {
      // Use a stable storage key to prevent collisions and warnings across multiple instances.
  // Migrate old storage key to new brand key once (non-destructive)
  storageKey: 'trendology.auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  cachedClient = client
  // Persist across module reloads in development (HMR)
  if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.__trendology_supabase = client
  }

  // One-time migration: copy existing session from old key if present
  try {
    if (typeof window !== 'undefined') {
      const legacy = localStorage.getItem('aamardokan.auth')
      if (legacy && !localStorage.getItem('trendology.auth')) {
        localStorage.setItem('trendology.auth', legacy)
      }
    }
  } catch {}

  return cachedClient
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
