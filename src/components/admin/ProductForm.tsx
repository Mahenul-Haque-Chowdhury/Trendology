"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Product } from '@/lib/products'
import { CATEGORIES } from '@/lib/categories'
import ImageUploader from '@/components/ImageUploader'
import GalleryUploader from '@/components/GalleryUploader'

export type ProductFormValues = Omit<Product, 'id' | 'active'>

export type ProductFormProps = {
  product: Product | null
  onSubmit: (data: ProductFormValues) => void
  onCancel?: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState<number>(product?.price ?? 0)
  const [category, setCategory] = useState(product?.category ?? '')
  const [tags, setTags] = useState<string>(product ? product.tags.join(', ') : '')
  const [image, setImage] = useState(product?.image ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [description, setDescription] = useState(product?.description ?? '')

  useEffect(() => {
    setName(product?.name ?? '')
    setPrice(product?.price ?? 0)
    setCategory(product?.category ?? '')
    setTags(product ? product.tags.join(', ') : '')
    setImage(product?.image ?? '')
    setImages(product?.images ?? [])
    setDescription(product?.description ?? '')
  }, [product])

  const canSubmit = useMemo(() => name.trim() && category.trim() && price >= 0, [name, category, price])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      images: images.filter(Boolean),
      category: category.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      created_at: product?.created_at ?? new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-3 grid-cols-1 sm:grid-cols-2">
      <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input" placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      <div className="sm:col-span-2">
        <input className="input w-full" list="categories" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <datalist id="categories">
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </datalist>
      </div>
      <input className="input sm:col-span-2" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />

      <div className="sm:col-span-2 grid grid-cols-1 gap-2">
        <label className="text-sm text-gray-700">Main image</label>
        <div className="flex items-center gap-3">
          <input className="input flex-1" placeholder="Main image URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <ImageUploader label="Upload" folder="products/main" onUploaded={(url) => setImage(url)} />
        </div>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded border" />
        )}
      </div>

      <div className="sm:col-span-2 grid grid-cols-1 gap-2">
        <label className="text-sm text-gray-700">Gallery images</label>
        <div className="flex items-center gap-3">
          <input
            className="input flex-1"
            placeholder="Extra image URLs (comma separated)"
            value={images.join(', ')}
            onChange={(e) => setImages(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
          <ImageUploader label="Upload" folder="products/gallery" onUploaded={(url) => setImages((prev) => [...prev, url])} />
        </div>
        <GalleryUploader folder="products/gallery" onUploaded={(items) => setImages((prev) => [...prev, ...items.map((i) => i.url)])} />
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((g, idx) => (
              <div key={g + idx} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g} alt="Gallery" className="w-20 h-20 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs"
                  title="Remove"
                  onClick={async () => {
                    const next = images.filter((_, i) => i !== idx)
                    setImages(next)
                    // Best-effort delete from storage via API
                    try {
                      const path = new URL(g).pathname.split('/').slice(3).join('/')
                      let headers: Record<string, string> = { 'Content-Type': 'application/json' }
                      try {
                        const mod = await import('@/lib/supabase')
                        const supabase = mod.getSupabaseClient()
                        const sess = await supabase?.auth.getSession()
                        const token = sess?.data?.session?.access_token
                        if (token) headers.Authorization = `Bearer ${token}`
                      } catch {}
                      fetch('/api/admin/upload', { method: 'DELETE', headers, body: JSON.stringify({ path }) })
                    } catch {}
                  }}
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button type="button" className="text-[10px] bg-white/80 rounded px-1" onClick={() => {
                    if (idx === 0) return
                    const next = [...images]
                    const [m] = next.splice(idx, 1)
                    next.splice(idx - 1, 0, m)
                    setImages(next)
                  }}>↑</button>
                  <button type="button" className="text-[10px] bg-white/80 rounded px-1" onClick={() => {
                    if (idx === images.length - 1) return
                    const next = [...images]
                    const [m] = next.splice(idx, 1)
                    next.splice(idx + 1, 0, m)
                    setImages(next)
                  }}>↓</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <textarea className="textarea sm:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="sm:col-span-2 flex gap-2 justify-end">
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>{product ? 'Save Changes' : 'Add Product'}</button>
      </div>
    </form>
  )
}
