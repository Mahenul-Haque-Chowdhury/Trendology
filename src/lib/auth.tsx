"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type User = {
  id: string
  name: string
  email: string
  password?: string // Demo-only fallback
}

const UsersKey = 'storefront.users.v1'
const SessionKey = 'storefront.session.v1'

type AuthState = {
  user: User | null
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; message?: string }>
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
}

const AuthCtx = createContext<AuthState | null>(null)

function loadUsers(): User[] {
  try { const raw = localStorage.getItem(UsersKey); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveUsers(users: User[]) { try { localStorage.setItem(UsersKey, JSON.stringify(users)) } catch {} }
function loadSession(): string | null { try { return localStorage.getItem(SessionKey) } catch { return null } }
function saveSession(id: string | null) { try { id ? localStorage.setItem(SessionKey, id) : localStorage.removeItem(SessionKey) } catch {} }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const useSupabase = isSupabaseConfigured()

  useEffect(() => {
    if (!useSupabase) {
      if (typeof window === 'undefined') return
      const id = loadSession()
      if (!id) return
      const found = loadUsers().find((u) => u.id === id)
      if (found) setUser(found)
      return
    }
    const supabase = getSupabaseClient()!

    async function ensureProfile(u: import('@supabase/supabase-js').User) {
      try {
        const payload = {
          id: u.id,
          email: u.email,
          name: (u.user_metadata?.name as string) || u.email,
        }
        // Upsert profile so the "user data" table is populated even for existing users
        await supabase.from('profiles').upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
      } catch (e) {
        console.debug('[auth] ensureProfile skipped/failed:', e)
      }
    }
    supabase.auth.getSession().then(({ data }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      const u = data.session?.user
      if (u) {
        setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email!, email: u.email! })
        ensureProfile(u)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: import('@supabase/supabase-js').AuthChangeEvent,
      session: import('@supabase/supabase-js').Session | null
    ) => {
      const u = session?.user
      if (u) {
        setUser({ id: u.id, name: (u.user_metadata?.name as string) || u.email!, email: u.email! })
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
      const users = loadUsers()
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, message: 'Email already registered' }
      const newUser: User = { id: 'U-' + Date.now().toString(36), name, email, password }
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
      const users = loadUsers()
      const u = users.find((it) => it.email.toLowerCase() === email.toLowerCase() && it.password === password)
      if (!u) return { ok: false, message: 'Invalid credentials' }
      saveSession(u.id)
      setUser(u)
      return { ok: true }
    },
    logout() {
      if (useSupabase) {
        const supabase = getSupabaseClient()!
        supabase.auth.signOut()
      }
      saveSession(null)
      setUser(null)
    },
  }), [user, useSupabase])

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>
}

export function useAuth() { const ctx = useContext(AuthCtx); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
