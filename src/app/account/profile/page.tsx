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
  const { user } = useAuth()
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
      if (error && !data) { setErr(error.message); return }
      // Merge with auth session defaults so form is prefilled after signup
      setProfile({
        id: u.id,
        email: data?.email ?? u.email,
        name: data?.name ?? u.name,
        phone: data?.phone ?? (u as any)?.phone ?? (u as any)?.user_metadata?.phone ?? '',
        address: data?.address ?? '',
        city: data?.city ?? '',
        country: data?.country ?? '',
      })
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
      const payload = {
        id: user!.id,
        email: String(fd.get('email') || ''),
        name: String(fd.get('name') || ''),
        phone: String(fd.get('phone') || ''),
        address: String(fd.get('address') || ''),
        city: String(fd.get('city') || ''),
        country: String(fd.get('country') || ''),
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
      if (error) throw error
      setMsg('Profile updated')
      setProfile(payload)
    } catch (e: any) {
      setErr(e?.message || 'Failed to save profile')
    } finally { setBusy(false) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
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
            <label className="block text-sm font-medium">Address</label>
            <input name="address" defaultValue={profile?.address || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input name="city" defaultValue={profile?.city || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input name="country" defaultValue={profile?.country || ''} className="border rounded-md px-3 py-2 w-full" />
          </div>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Profile'}</button>
      </form>
      </div>
      {/* Side summary card */}
      <aside className="card p-6 space-y-3 h-max">
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
