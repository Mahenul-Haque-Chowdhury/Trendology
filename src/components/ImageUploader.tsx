"use client"
import React, { useRef, useState } from 'react'

export default function ImageUploader({ label = 'Upload image', folder = 'products', onUploaded }: { label?: string; folder?: string; onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      let headers: Record<string, string> | undefined
      try {
        const supabase = (await import('@/lib/supabase')).getSupabaseClient()
        const sess = await supabase?.auth.getSession()
        const token = sess?.data?.session?.access_token
        if (token) headers = { Authorization: `Bearer ${token}` }
      } catch {}
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, headers })
      const out = await res.json()
      if (!out.ok) throw new Error(out.error || 'Upload failed')
      onUploaded(out.url)
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} disabled={busy} />
        <span className="text-sm text-gray-600">{busy ? 'Uploading…' : label}</span>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
