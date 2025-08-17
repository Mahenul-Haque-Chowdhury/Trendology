"use client"
import { useCatalog } from '@/lib/catalog'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'
import ImageUploader from '@/components/ImageUploader'
import GalleryUploader from '@/components/GalleryUploader'

export default function AdminProductsPage() {
  const { products, add, update, remove, categories } = useCatalog()
  const [editing, setEditing] = useState<Product | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | 'all'>('all')
  const [onlyActive, setOnlyActive] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [mainImage, setMainImage] = useState<string>(editing?.image || '')
  const [gallery, setGallery] = useState<string[]>(editing?.images || [])

  useEffect(() => {
    let ignore = false
    async function fetchCount() {
      try {
        const res = await fetch('/api/admin/products')
        const json = await res.json()
        if (!ignore && json?.ok) setCount(Array.isArray(json.items) ? json.items.length : null)
      } catch {}
    }
    fetchCount()
    return () => { ignore = true }
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const base = {
      name: String(fd.get('name') || ''),
      description: String(fd.get('description') || ''),
      price: Number(fd.get('price') || 0),
      image: String(fd.get('image') || ''),
      images: String(fd.get('images') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      category: String(fd.get('category') || ''),
      tags: String(fd.get('tags') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (editing) {
      update({ ...editing, ...base })
      setEditing(null)
    } else {
      const id = add(base)
      setEditing(null)
      console.log('Created product', id)
    }
    e.currentTarget.reset()
  }

  function startEdit(p: Product) {
    setEditing(p)
  setMainImage(p.image || '')
  setGallery(p.images || [])
  }

  const filtered = useMemo(() => {
    let list = products
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (onlyActive) list = list.filter((p) => p.active !== false)
    return list
  }, [products, query, category, onlyActive])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Admin</h1>

      <section className="card p-4">
        <h2 className="text-lg font-semibold mb-3">{editing ? 'Edit Product' : 'Add Product'}</h2>
  <form className="grid gap-3 grid-cols-1 sm:grid-cols-2" onSubmit={onSubmit}>
          <input name="name" placeholder="Name" defaultValue={editing?.name} className="border rounded-md px-3 py-2" required />
          <input name="price" placeholder="Price" type="number" step="0.01" defaultValue={editing?.price} className="border rounded-md px-3 py-2" required />
          <input name="category" placeholder="Category" defaultValue={editing?.category} list="categories" className="border rounded-md px-3 py-2" required />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input name="tags" placeholder="Tags (comma separated)" defaultValue={editing?.tags.join(', ')} className="border rounded-md px-3 py-2 sm:col-span-2" />
          <div className="sm:col-span-2 grid grid-cols-1 gap-2">
            <label className="text-sm text-gray-700">Main image</label>
            <div className="flex items-center gap-3">
              <input
                name="image"
                placeholder="Main image URL"
                defaultValue={editing?.image}
                className="border rounded-md px-3 py-2 flex-1"
                onChange={(e) => setMainImage(e.target.value)}
              />
              <ImageUploader label="Upload" folder="products/main" onUploaded={(url) => {
                const el = (document.querySelector('input[name=\"image\"]') as HTMLInputElement | null)
                if (el) el.value = url
                setMainImage(url)
              }} />
            </div>
            {mainImage && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImage} alt="Preview" className="w-32 h-32 object-cover rounded border" />
              </div>
            )}
          </div>
          <div className="sm:col-span-2 grid grid-cols-1 gap-2">
            <label className="text-sm text-gray-700">Gallery images</label>
            <div className="flex items-center gap-3">
              <input
                name="images"
                placeholder="Extra image URLs (comma separated)"
                defaultValue={editing?.images?.join(', ')}
                className="border rounded-md px-3 py-2 flex-1"
                onChange={(e) => setGallery(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
              <ImageUploader label="Upload" folder="products/gallery" onUploaded={(url) => {
                const el = (document.querySelector('input[name=\"images\"]') as HTMLInputElement | null)
                if (el) el.value = el.value ? `${el.value}, ${url}` : url
                setGallery((prev) => [...prev, url])
              }} />
            </div>
            <GalleryUploader folder="products/gallery" onUploaded={(items) => {
              const urls = items.map((i) => i.url)
              setGallery((prev) => {
                const next = [...prev, ...urls]
                const el = (document.querySelector('input[name=\"images\"]') as HTMLInputElement | null)
                if (el) el.value = next.join(', ')
                return next
              })
            }} />
            {gallery.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {gallery.map((g, idx) => (
                  <div key={g + idx} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="Gallery" className="w-20 h-20 object-cover rounded border" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs"
                      title="Remove"
                      onClick={() => {
                        const next = gallery.filter((_, i) => i !== idx)
                        setGallery(next)
                        const el = (document.querySelector('input[name=\"images\"]') as HTMLInputElement | null)
                        if (el) el.value = next.join(', ')
                        // Try deleting from storage (best effort)
                        try {
                          const path = new URL(g).pathname.split('/').slice(3).join('/') // /storage/v1/object/public/<bucket>/... -> path
                          fetch('/api/admin/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) })
                        } catch {}
                      }}
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button type="button" className="text-[10px] bg-white/80 rounded px-1" onClick={() => {
                        if (idx === 0) return
                        const next = [...gallery]
                        const [m] = next.splice(idx, 1)
                        next.splice(idx - 1, 0, m)
                        setGallery(next)
                        const el = (document.querySelector('input[name=\"images\"]') as HTMLInputElement | null)
                        if (el) el.value = next.join(', ')
                      }}>↑</button>
                      <button type="button" className="text-[10px] bg-white/80 rounded px-1" onClick={() => {
                        if (idx === gallery.length - 1) return
                        const next = [...gallery]
                        const [m] = next.splice(idx, 1)
                        next.splice(idx + 1, 0, m)
                        setGallery(next)
                        const el = (document.querySelector('input[name=\"images\"]') as HTMLInputElement | null)
                        if (el) el.value = next.join(', ')
                      }}>↓</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <textarea name="description" placeholder="Description" defaultValue={editing?.description} className="border rounded-md px-3 py-2 sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn btn-primary" type="submit">{editing ? 'Save Changes' : 'Add Product'}</button>
            {editing && (
              <button className="btn" type="button" onClick={() => setEditing(null)}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      <section className="card p-4">
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">All Products ({filtered.length})</h2>
            {count !== null && <p className="text-xs text-gray-500">DB count: {count}</p>}
          </div>
          <div className="flex gap-2">
            <input className="border rounded-md px-3 py-2" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="border rounded-md px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
              Only active
            </label>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-3">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded" />
                ) : (
                  <div className="w-14 h-14 rounded bg-gray-100" />
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">ID: {p.id}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 truncate">{p.category} · ${p.price.toFixed(2)} · {p.active === false ? 'Hidden' : 'Active'}</div>
              <div className="flex items-center gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={p.active !== false} onChange={(e) => update({ ...p, active: e.target.checked })} /> Active
                </label>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
