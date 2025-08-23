"use client"
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { User, Mail, Phone, Home, CheckCircle2, AlertTriangle, Edit, X } from 'lucide-react'

type Profile = {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
}

// Skeleton component for the initial loading state
const ProfileSkeleton = () => (
  <div className="card p-6 sm:p-8 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-8 w-40 bg-gray-200 rounded"></div>
      <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
    </div>
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded-md"></div>
        </div>
        <div>
          <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded-md"></div>
        </div>
        <div>
          <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 w-full bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
)

// Component for when the user is not logged in
const LoggedOutView = () => (
  <div className="max-w-md mx-auto card p-8 text-center space-y-4">
    <h1 className="text-2xl font-bold">My Profile</h1>
    <p className="text-gray-600">Please sign in to view and manage your profile.</p>
    <div className="flex gap-3 justify-center pt-2">
      <Link href="/account/login" className="btn btn-primary">Sign In</Link>
      <Link href="/account/register" className="btn">Create Account</Link>
    </div>
  </div>
)

export default function ProfilePage() {
  const { user, updateDisplayName } = useAuth()
  const supa = isSupabaseConfigured() ? getSupabaseClient() : null
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialProfile, setInitialProfile] = useState<Profile | null>(null)

  // UI State
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const u = user
    async function loadProfile() {
      setLoading(true)
      setErr(null)
      
      if (!supa) {
        // Demo mode: use basic info from user only
        const demoProfile = { id: u.id, email: u.email, name: u.name, phone: '', address: '', city: '', country: '' }
        setProfile(demoProfile)
        setInitialProfile(demoProfile)
        setLoading(false)
        return
      }
      
      // Database fetch logic
      const client = supa
      try {
        const loadFrom = (table: string) => client.from(table).select('id,email,name,phone,address,city,country').eq('id', u.id).maybeSingle()
        
        let { data, error } = await loadFrom('user_details')
        if (error || !data) {
          ({ data, error } = await loadFrom('profiles'))
        }

        if (error && !data) {
          const tableMissing = error.message.toLowerCase().includes("relation") && error.message.toLowerCase().includes("does not exist")
          if (tableMissing) {
            setMsg('Database tables not found. Run the Supabase setup SQL to enable profile storage. Using session data for now.')
            const fallbackProfile = { id: u.id, email: u.email, name: u.name, phone: '', address: '', city: '', country: '' }
            setProfile(fallbackProfile)
            setInitialProfile(fallbackProfile)
            return
          }
          throw error
        }

        // Merge DB data with auth session defaults and any pending local data
        let pendingLocal: any = null
        try {
          const raw = localStorage.getItem('storefront.user_details.pending')
          pendingLocal = raw ? JSON.parse(raw) : null
        } catch {}

        const merged = {
          id: u.id,
          email: data?.email ?? u.email,
          name: data?.name ?? u.name,
          phone: data?.phone ?? pendingLocal?.phone ?? (u as any)?.user_metadata?.phone ?? (u as any)?.phone ?? '',
          address: data?.address ?? '',
          city: data?.city ?? '',
          country: data?.country ?? '',
        }
        setProfile(merged)
        setInitialProfile(merged) // Save initial state for cancellation

        // Cache for checkout fallback and clear pending cache
        localStorage.setItem(`storefront.user_details.${u.id}`, JSON.stringify(merged))
        localStorage.removeItem('storefront.user_details.pending')
      } catch (e: any) {
        setErr(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user, supa])

  const handleCancel = () => {
    setProfile(initialProfile) // Revert changes
    setEditing(false)
    setMsg(null)
    setErr(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setMsg(null); setErr(null); setBusy(true)
    const fd = new FormData(e.currentTarget)
    
    const payload = {
      id: user.id,
      email: String(fd.get('email') || ''),
      name: String(fd.get('name') || ''),
      phone: String(fd.get('phone') || ''),
    }

    try {
      if (!supa) {
        setMsg('Profile saved locally for demo (won’t persist).')
        setEditing(false)
        return
      }

      const saveTo = (table: string) => supa.from(table).upsert(payload, { onConflict: 'id' })
      let { error } = await saveTo('user_details')
      if (error) { // Fallback to 'profiles' table
        ({ error } = await saveTo('profiles'))
      }
      
      if (error) throw error

      setMsg('Your profile has been updated successfully.')
      const updatedProfile = { ...(profile as Profile), ...payload }
      setProfile(updatedProfile)
      setInitialProfile(updatedProfile)
      if (payload.name) updateDisplayName(payload.name)

      // Update local cache for checkout prefill
      localStorage.setItem(`storefront.user_details.${user.id}`, JSON.stringify(updatedProfile))
      setEditing(false)

    } catch (e: any) {
      setErr(e?.message || 'Failed to save profile. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  
  if (loading) return <ProfileSkeleton />
  if (!user) return <LoggedOutView />

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} ref={formRef}>
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Profile</h1>
            <div className="flex items-center gap-3">
              {editing ? (
                <>
                  <button className="btn" type="button" onClick={handleCancel} disabled={busy}>Cancel</button>
                  <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
                </>
              ) : (
                <button className="btn btn-primary" type="button" onClick={() => setEditing(true)}>
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications */}
          <div className="pt-4">
            {msg && <div className="alert-success"><CheckCircle2 size={20} /><span>{msg}</span></div>}
            {err && <div className="alert-danger"><AlertTriangle size={20} /><span>{err}</span></div>}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-6 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <div className="form-control-wrapper">
                  <User size={18} className="form-control-icon" />
                  <input id="name" name="name" defaultValue={profile?.name || ''} className="form-input pl-10" disabled={!editing} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="form-control-wrapper">
                  <Mail size={18} className="form-control-icon" />
                  <input id="email" name="email" type="email" defaultValue={profile?.email || ''} className="form-input pl-10" disabled={!editing} />
                </div>
              </div>
              <div className="form-group sm:col-span-2">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="form-control-wrapper">
                  <Phone size={18} className="form-control-icon" />
                  <input id="phone" name="phone" defaultValue={profile?.phone || ''} className="form-input pl-10" disabled={!editing} />
                </div>
              </div>
            </div>

            {/* Address Book Section */}
            <div className="pt-4 !mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Home size={18} /> Address Book</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your saved shipping and billing addresses.</p>
                  </div>
                  <Link href="/account/address" className="btn shrink-0 w-full sm:w-auto">Go to Address Book</Link>
                </div>
            </div>
          </div>
        </form>
      </div>
  </motion.div>
  )
}