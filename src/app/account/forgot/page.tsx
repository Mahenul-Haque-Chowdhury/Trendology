"use client"
import { useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const supa = isSupabaseConfigured() ? getSupabaseClient() : null
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null); setBusy(true)
    try {
      if (!supa) {
        setMsg('Demo mode: password resets are not available without Supabase.')
        return
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/account/reset`
      })
      if (error) throw error
      setMsg('If the email exists, a reset link has been sent.')
    } catch (e: any) {
      setErr(e?.message || 'Failed to send reset email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
    </div>
  )
}
