"use client"
import React, { useCallback, useRef, useState } from 'react'

type Uploaded = { url: string; path: string }

export default function GalleryUploader({
  folder = 'products/gallery',
  onUploaded,
  label = 'Drop images here or click to upload',
  multiple = true,
  maxFiles = 10,
  compress = true,
  maxSize = 1600,
  quality = 0.8,
}: {
  folder?: string
  onUploaded: (items: Uploaded[]) => void
  label?: string
  multiple?: boolean
  maxFiles?: number
  compress?: boolean
  maxSize?: number
  quality?: number
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const compressImage = useCallback(async (file: File): Promise<File> => {
    if (!compress) return file
    if (!file.type.startsWith('image/')) return file
    const img = document.createElement('img')
    const reader = new FileReader()
    const loaded: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
      reader.onload = () => { img.onload = () => resolve(img); img.onerror = reject; img.src = String(reader.result) }
      reader.onerror = reject
    })
    reader.readAsDataURL(file)
    const el = await loaded
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    let { width, height } = el
    const scale = Math.min(1, maxSize / Math.max(width, height))
    width = Math.round(width * scale)
    height = Math.round(height * scale)
    canvas.width = width
    canvas.height = height
    ctx.drawImage(el, 0, 0, width, height)
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/webp', quality))
    return new File([blob], file.name.replace(/\.[^.]+$/,'') + '.webp', { type: 'image/webp' })
  }, [compress, maxSize, quality])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, maxFiles)
    setErrors([])
    setProgress(list.map(() => 0))
    const results: Uploaded[] = []
    for (let i = 0; i < list.length; i++) {
      let file = list[i]
      try {
        // optional compression
        try {
          file = await compressImage(file)
        } catch {}
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
        results.push({ url: out.url as string, path: out.path as string })
        setProgress((p) => p.map((v, idx) => (idx === i ? 100 : v)))
      } catch (e: any) {
        setErrors((prev) => [...prev, e?.message || String(e)])
      }
    }
    if (results.length) onUploaded(results)
  }, [compressImage, folder, maxFiles, onUploaded])

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${dragOver ? 'bg-blue-50 border-blue-300' : 'border-gray-300'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <p className="text-sm text-gray-700">{label}</p>
      </div>
      {progress.length > 0 && (
        <div className="mt-2 space-y-1">
          {progress.map((p, idx) => (
            <div key={idx} className="h-1 bg-gray-200 rounded"><div className="h-1 bg-brand rounded" style={{ width: `${p}%` }} /></div>
          ))}
        </div>
      )}
      {errors.length > 0 && (
        <ul className="mt-2 text-sm text-red-600 list-disc ms-5">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}
