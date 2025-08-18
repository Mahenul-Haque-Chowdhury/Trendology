"use client"
import React, { useEffect, useState } from 'react'

type Health = {
  ok: boolean
  mode: string
  adminEmailsConfigured: boolean
  adminEmails: string
  user: { id: string; email: string; role?: string | null } | null
  isAdmin: boolean
  env: { hasSupabaseUrl: boolean; hasAnon: boolean; hasService: boolean }
  error?: string | null
}

export default function AdminHelpBanner({ code, message }: { code?: number; message?: string }) {
  const [health, setHealth] = useState<Health | null>(null)
  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch('/api/admin/health', { cache: 'no-store' })
        const json = await res.json()
        if (!ignore) setHealth(json)
      } catch {}
    }
    load()
    return () => { ignore = true }
  }, [])

  const isUnauthorized = code === 401 || (message || '').toLowerCase().includes('unauthorized')
  const show = isUnauthorized || (health && health.mode === 'supabase' && (!health.user || !health.isAdmin))
  if (!show) return null

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="font-semibold mb-1">Admin access required</div>
      {message && <div className="text-sm mb-1">Server said: {message}{code ? ` (HTTP ${code})` : ''}</div>}
      {health && (
        <ul className="text-sm list-disc ms-5 space-y-1">
          <li>Auth mode: <b>{health.mode || 'n/a'}</b></li>
          <li>Signed in: <b>{health.user ? `yes (${health.user.email})` : 'no'}</b></li>
          <li>Is admin: <b>{health.isAdmin ? 'yes' : 'no'}</b></li>
          <li>Admin emails configured: <b>{health.adminEmailsConfigured ? health.adminEmails : 'no'}</b></li>
          <li>Server env: URL={String(health.env?.hasSupabaseUrl)} ANON={String(health.env?.hasAnon)} SERVICE={String(health.env?.hasService)}</li>
        </ul>
      )}
      <div className="text-sm mt-2">
        Try: log in with an admin email on the live site, ensure your email is in ADMIN_EMAILS, and that Supabase env vars are set. You can also open <a className="underline" href="/api/admin/health" target="_blank">/api/admin/health</a>.
      </div>
    </div>
  )
}
