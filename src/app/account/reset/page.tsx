"use client"
import { useEffect, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supa = isSupabaseConfigured() ? getSupabaseClient() : null
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supa) return
    // Supabase v2 sends ?code=... for recovery links; exchange it for a session
    const code = params?.get('code')
    if (code) {
      supa.auth.exchangeCodeForSession(code).catch((e) => {
        setErr(e?.message || 'Invalid or expired reset link')
      })
    }
    // If using hash tokens, Supabase client should pick it up automatically on load
  }, [params, supa])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null); setBusy(true)
    try {
      if (!supa) {
        setMsg('Demo mode: cannot update password without Supabase.')
        return
      }
      const { error } = await supa.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMsg('Password updated. Redirecting to login…')
      setTimeout(() => router.push('/account/login'), 1200)
    } catch (e: any) {
      setErr(e?.message || 'Failed to update password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Set New Password</h1>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border rounded-md px-3 py-2 w-full" placeholder="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>
  )
}
