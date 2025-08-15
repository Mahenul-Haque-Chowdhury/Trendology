"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
}

export default function ProfilePage() {
  const { user, updateDisplayName } = useAuth()
  const supa = isSupabaseConfigured() ? getSupabaseClient() : null
  const [profile, setProfile] = useState<Profile | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!user) return
    const u = user
    async function load() {
      setErr(null)
      if (!supa) {
        // demo mode: use basic info from user only
        setProfile({ id: u.id, email: u.email, name: u.name })
        return
      }
      const client = supa!
      const tableMissing = (m?: string | null) =>
        !!m && (m.includes("schema cache") || m.toLowerCase().includes("not find the table") || m.toLowerCase().includes("relation") && m.toLowerCase().includes("does not exist"))
      async function loadFrom(table: string) {
        return await client
          .from(table)
          .select('id,email,name,phone,address,city,country')
          .eq('id', u.id)
          .maybeSingle()
      }
      let data: any = null; let error: any = null
      // try user_details first
      let res = await loadFrom('user_details')
      if (res.error) {
        // fallback to profiles
        res = await loadFrom('profiles')
      }
      data = res.data; error = res.error
      if (error && !data) {
        if (tableMissing(error.message)) {
          // Soft fallback: DB not set up yet. Use session data and inform the user.
          setMsg('Database tables not found. Run the Supabase setup SQL to enable profile storage. Using session data for now.')
          setProfile({ id: u.id, email: u.email, name: u.name, phone: '', address: '', city: '', country: '' })
          return
        }
        setErr(error.message)
        return
      }
  // Merge with auth session defaults so form is prefilled after signup
  const merged = {
        id: u.id,
        email: data?.email ?? u.email,
        name: data?.name ?? u.name,
        phone: data?.phone ?? (u as any)?.phone ?? (u as any)?.user_metadata?.phone ?? '',
        address: data?.address ?? '',
        city: data?.city ?? '',
        country: data?.country ?? '',
  }
  setProfile(merged)
  // cache for checkout fallback
  try { if (typeof window !== 'undefined') localStorage.setItem(`storefront.user_details.${u.id}`, JSON.stringify(merged)) } catch {}
    }
    load()
  }, [user, supa])

  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>Please sign in to manage your profile.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null); setErr(null); setBusy(true)
    const fd = new FormData(e.currentTarget)
    try {
      if (!supa) {
        setMsg('Profile saved locally for demo (won’t persist).')
        setBusy(false)
        return
      }
  // Only update basic info here; addresses are managed in Addressbook
  const payload = {
        id: user!.id,
        email: String(fd.get('email') || ''),
        name: String(fd.get('name') || ''),
        phone: String(fd.get('phone') || ''),
      }
      // Prefer user_details; if missing, fallback to profiles
      const client2 = supa!
      async function saveTo(table: string) {
        return await client2.from(table).upsert(payload, { onConflict: 'id' })
      }
      let { error } = await saveTo('user_details')
      if (error) {
        const alt = await saveTo('profiles')
        error = alt.error
      }
      if (error) {
        if (error.message && (error.message.includes('schema cache') || error.message.toLowerCase().includes('not find the table'))) {
          setMsg('Profile saved locally. To persist, run the Supabase SQL in SUPABASE_SQL_FOR_YOUR_TABLES.sql (creates profiles & user_details).')
          setProfile(payload)
          return
        }
        throw error
      }
  setMsg('Profile updated')
  // Preserve any existing address fields locally while updating core fields
  setProfile((prev) => ({ ...(prev || { id: user!.id, email: payload.email }), ...payload }))
  // reflect change in header immediately
  if (payload.name) updateDisplayName(payload.name)
  // update local cache for checkout prefill
  try {
    if (typeof window !== 'undefined') {
      const merged = { ...(profile || {}), ...payload }
      localStorage.setItem(`storefront.user_details.${user!.id}`, JSON.stringify(merged))
    }
  } catch {}
    } catch (e: any) {
      setErr(e?.message || 'Failed to save profile')
    } finally { setBusy(false) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 sm:gap-6">
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
          <button className="btn" type="button" onClick={() => setEditing((v) => !v)}>{editing ? 'Close' : 'Edit Profile'}</button>
        </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input name="name" defaultValue={profile?.name || user?.name || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" defaultValue={profile?.email || user?.email || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input name="phone" defaultValue={profile?.phone || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="block text-sm font-medium">Addresses</div>
                <p className="text-xs text-gray-500">Manage your shipping addresses in the Addressbook.</p>
              </div>
              <Link href="/account/address" className="btn flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                <span>Go to Addressbook</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center justify-end sm:justify-start sticky bottom-3 sm:static bg-white/70 sm:bg-transparent backdrop-blur sm:backdrop-blur-0 p-2 sm:p-0 rounded-md">
          <button className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </form>
      </div>
      {/* Side summary card (moves below form on mobile) */}
      <aside className="card p-6 space-y-3 h-max order-first lg:order-none">
        <h2 className="text-lg font-semibold">Account Info</h2>
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div className="font-medium">{profile?.name || user?.name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium break-all">{profile?.email || user?.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Phone</div>
          <div className="font-medium">{profile?.phone || '-'}</div>
        </div>
        <div className="text-sm text-gray-500">Use the Edit Profile button to update your details.</div>
      </aside>
    </div>
  )
}
