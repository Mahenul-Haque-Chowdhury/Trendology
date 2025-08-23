"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type User = {
  id: string
  name: string
  email: string
  created_at: string
  password?: string // Demo-only fallback
}

// Unified brand storage keys (migrate from legacy 'storefront.*').
const UsersKey = 'trendology.users.v1'
const SessionKey = 'trendology.session.v1'

type AuthState = {
  user: User | null
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; message?: string }>
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

function migrateLegacy() {
  try {
    const map: [string, string][] = [
      ['storefront.users.v1', UsersKey],
      ['storefront.session.v1', SessionKey],
    ]
    for (const [oldKey, newKey] of map) {
      const oldVal = localStorage.getItem(oldKey)
      if (oldVal && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldVal)
      }
    }
  } catch {}
}
function loadUsers(): User[] {
  try { migrateLegacy(); const raw = localStorage.getItem(UsersKey); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveUsers(users: User[]) { try { localStorage.setItem(UsersKey, JSON.stringify(users)) } catch {} }
function loadSession(): string | null { try { migrateLegacy(); return localStorage.getItem(SessionKey) } catch { return null } }
function saveSession(id: string | null) { try { id ? localStorage.setItem(SessionKey, id) : localStorage.removeItem(SessionKey) } catch {} }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const useSupabase = isSupabaseConfigured()
  const demoAuthEnabled = (process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH || '').toLowerCase() === 'true'

  useEffect(() => {
    if (!useSupabase) {
      if (typeof window === 'undefined') return
      migrateLegacy()
      const id = loadSession()
      if (!id) return
      const found = loadUsers().find((u) => u.id === id)
      if (found) setUser(found)
      return
    }
    const supabase = getSupabaseClient()!

  const ensuredRef = { current: false }
  async function ensureProfile(u: import('@supabase/supabase-js').User) {
      if (ensuredRef.current) return
      // Guard against duplicate upserts in dev (React Strict Mode runs effects twice)
      const guardKey = `storefront.ensureProfile.${u.id}`
      try {
        if (typeof window !== 'undefined' && sessionStorage.getItem(guardKey) === '1') {
          ensuredRef.current = true
          return
        }
      } catch {}
      try {
        const payload = {
          id: u.id,
          email: u.email,
      name: (u.user_metadata?.name as string) || u.email,
      phone: (u.user_metadata?.phone as string) || null,
        }
        // Upsert profile so the "user data" table is populated even for existing users
        await supabase.from('profiles').upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
        // Also try to persist into user_details if available (ignore if table missing)
        try {
          await supabase.from('user_details').upsert(payload as any, { onConflict: 'id', ignoreDuplicates: false })
        } catch {}
        ensuredRef.current = true
        try { if (typeof window !== 'undefined') sessionStorage.setItem(guardKey, '1') } catch {}
      } catch (e) {
        console.debug('[auth] ensureProfile skipped/failed:', e)
      }
    }
    supabase.auth.getSession().then(({ data }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      const u = data.session?.user
      if (u) {
        setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email!, email: u.email!, created_at: new Date().toISOString() })
        ensureProfile(u)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: import('@supabase/supabase-js').AuthChangeEvent,
      session: import('@supabase/supabase-js').Session | null
    ) => {
      const u = session?.user
      if (u) {
        setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email!, email: u.email!, created_at: new Date().toISOString() })
        ensureProfile(u)
      } else {
        setUser(null)
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [useSupabase])

  const api: AuthState = useMemo(() => ({
    user,
    async register(name, email, password, phone) {
  if (useSupabase) {
        const supabase = getSupabaseClient()!
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } })
        if (error) return { ok: false, message: error.message }
        return { ok: true }
      }
  if (!demoAuthEnabled) return { ok: false, message: 'Email/password registration disabled' }
      const users = loadUsers()
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, message: 'Email already registered' }
      const newUser: User = { id: 'U-' + Date.now().toString(36), name, email, password, created_at: new Date().toISOString() }
      const next = [...users, newUser]
      saveUsers(next)
      saveSession(newUser.id)
      setUser(newUser)
      return { ok: true }
    },
    async login(email, password) {
  if (useSupabase) {
        const supabase = getSupabaseClient()!
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { ok: false, message: error.message }
        return { ok: true }
      }
  if (!demoAuthEnabled) return { ok: false, message: 'Password login disabled' }
      const users = loadUsers()
      const u = users.find((it) => it.email.toLowerCase() === email.toLowerCase() && it.password === password)
      if (!u) return { ok: false, message: 'Invalid credentials' }
      saveSession(u.id)
      setUser(u)
      return { ok: true }
    },
    async logout() {
      try {
        if (useSupabase) {
          const supabase = getSupabaseClient()!
          // Best-effort local sign-out
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
          // Hard-clear any persisted auth in case of edge cases
          try {
            localStorage.removeItem('trendology.auth')
            // Legacy cleanup
            localStorage.removeItem('aamardokan.auth')
          } catch {}
        }
      } finally {
        // Always clear fallback session
        saveSession(null)
        setUser(null)
        // Force a hard reload to ensure all client state is reset
        if (typeof window !== 'undefined') {
          setTimeout(() => { window.location.replace('/') }, 10)
        }
      }
    },
    async updateDisplayName(name: string) {
      // Update auth metadata (if using Supabase) and sync local header state
      if (useSupabase) {
        try {
          const supabase = getSupabaseClient()!
          await supabase.auth.updateUser({ data: { name } })
        } catch (e) {
          console.debug('[auth] updateDisplayName skipped/failed:', e)
        }
      }
      setUser((prev) => (prev ? { ...prev, name } : prev))
    },
  }), [user, useSupabase])

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>
}

export function useAuth() { const ctx = useContext(AuthCtx); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
