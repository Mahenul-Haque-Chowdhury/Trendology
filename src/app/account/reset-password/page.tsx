"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

/*
 Password reset / recovery handler for Supabase auth.
 Flow:
 1. User clicks email link (type=recovery&code=...)
 2. We exchange the code for a session (supabase.auth.exchangeCodeForSession)
 3. Show form to set a new password
 4. Call supabase.auth.updateUser({ password })
*/

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const router = useRouter()
  // Supabase sends `code` for recovery links. Older style / edge cases may provide `token_hash`.
  const code = search.get('code') || search.get('token_hash') || ''
  const type = search.get('type') || search.get('next') || ''
  const enabled = isSupabaseConfigured()
  const supabase = enabled ? getSupabaseClient() : null

  const [status, setStatus] = useState<'init'|'exchanging'|'ready'|'updating'|'success'|'error'>('init')
  const [error, setError] = useState<string>('')
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')

  // Exchange recovery code for a session
  useEffect(() => {
    if (!enabled) return
    if (!code) { setStatus('error'); setError('Missing recovery code (code or token_hash param not found).'); return }
    if (type && type !== 'recovery') {
      // Allow proceeding even if type absent (some links omit it), but if present and different show warning.
      console.warn('[reset-password] unexpected type param', type)
    }
    let cancelled = false
    ;(async () => {
      try {
        setStatus('exchanging')
  const { error: exErr } = await supabase!.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (exErr) { setStatus('error'); setError(exErr.message); return }
        setStatus('ready')
      } catch (e: any) {
        if (cancelled) return
        setStatus('error'); setError(e.message || 'Failed to verify code')
      }
    })()
    return () => { cancelled = true }
  }, [code, type, enabled, supabase])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw1.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (pw1 !== pw2) { setError('Passwords do not match.'); return }
    try {
      setStatus('updating'); setError('')
      const { error: upErr } = await supabase!.auth.updateUser({ password: pw1 })
      if (upErr) { setStatus('ready'); setError(upErr.message); return }
      setStatus('success')
      setTimeout(() => { router.replace('/account') }, 1800)
    } catch (e: any) {
      setStatus('ready'); setError(e.message || 'Update failed')
    }
  }

  if (!enabled) {
    return <div className="container mx-auto max-w-md py-20"><h1 className="text-2xl font-bold mb-4">Password Reset</h1><p className="text-sm text-red-600">Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY.</p></div>
  }

  return (
    <div className="container mx-auto max-w-md py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h1>
      <p className="text-sm text-gray-600 mb-6">Set a new password for your account.</p>
      {status === 'exchanging' && (
        <div className="p-4 rounded-md border bg-white shadow-sm text-sm">Verifying link…</div>
      )}
      {status === 'error' && (
        <div className="p-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 mb-4">{error || 'Something went wrong.'}</div>
      )}
      {(status === 'ready' || status === 'updating') && (
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="p-3 rounded-md border border-red-200 bg-red-50 text-xs text-red-700">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">New Password</label>
            <input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} className="input" required minLength={6} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} className="input" required minLength={6} />
          </div>
          {(() => { const updating = status === 'updating'; return (
            <button type="submit" disabled={updating} className="btn btn-primary w-full">{updating ? 'Updating…' : 'Update Password'}</button>
          )})()}
        </form>
      )}
      {status === 'success' && (
        <div className="p-4 rounded-md border border-green-200 bg-green-50 text-sm text-green-700">Password updated. Redirecting…</div>
      )}
    </div>
  )
}
