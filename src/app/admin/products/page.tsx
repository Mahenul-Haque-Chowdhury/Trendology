"use client"
import { useCatalog } from '@/lib/catalog'
import { CATEGORIES } from '@/lib/categories'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'
import AdminHelpBanner from '@/components/AdminHelpBanner'
import Modal from '@/components/Modal'
import ProductForm, { type ProductFormValues } from '@/components/admin/ProductForm'
import ProductTable from '@/components/admin/ProductTable'

export default function AdminProductsPage() {
  const { products, add, update, remove } = useCatalog()
  const [editing, setEditing] = useState<Product | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | 'all'>('all')
  const [onlyActive, setOnlyActive] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [apiError, setApiError] = useState<{ code?: number; message?: string } | null>(null)

  useEffect(() => {
    let ignore = false
    async function fetchCount() {
      try {
        let headers: Record<string, string> | undefined
        try {
          const supabase = (await import('@/lib/supabase')).getSupabaseClient()
          const sess = await supabase?.auth.getSession()
          const token = sess?.data?.session?.access_token
          if (token) headers = { Authorization: `Bearer ${token}` }
        } catch {}
        const res = await fetch('/api/admin/products', { headers })
        const json = await res.json()
        if (!ignore && json?.ok) {
          setCount(Array.isArray(json.items) ? json.items.length : null)
          setApiError(null)
        } else if (!ignore) {
          setApiError({ code: res.status, message: json?.error || 'Request failed' })
        }
      } catch {}
    }
    fetchCount()
    return () => { ignore = true }
  }, [])

  const filtered = useMemo(() => {
    let list = products
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (onlyActive) list = list.filter((p) => p.active !== false)
    return list
  }, [products, query, category, onlyActive])

  function openCreate() {
    setEditing(null)
    setIsOpen(true)
  }
  function openEdit(p: Product) {
    setEditing(p)
    setIsOpen(true)
  }
  function closeModal() {
    setIsOpen(false)
    setEditing(null)
  }

  async function handleSubmit(data: ProductFormValues) {
    if (editing) {
      await update({ ...editing, ...data })
    } else {
      await add(data)
    }
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">Product Admin</h1>
        <button className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>
      {apiError && <AdminHelpBanner code={apiError.code} message={apiError.message} />}

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
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
              Only active
            </label>
          </div>
        </div>
        <ProductTable
          products={filtered}
          onEdit={openEdit}
          onDelete={(id) => remove(id)}
          onToggleActive={(p, active) => update({ ...p, active })}
        />
      </section>

      <Modal isOpen={isOpen} onClose={closeModal} title={editing ? 'Edit Product' : 'Add Product'}>
        <ProductForm product={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
