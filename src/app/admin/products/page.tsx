"use client"
import { useCatalog } from '@/lib/catalog'
import { CATEGORIES } from '@/lib/categories'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'
import AdminHelpBanner from '@/components/AdminHelpBanner'
import Modal from '@/components/Modal'
import ProductForm, { type ProductFormValues } from '@/components/admin/ProductForm'
import ProductTable from '@/components/admin/ProductTable'
import { useAuth } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminProductsPage() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()!
  
  // FORCE ADMIN UI for testing (set to true to always show grid assignment buttons)
  const isAdmin = true
  const { products, add, update, remove } = useCatalog()
  // Grid assignments state (must be after products is defined)
  const [gridAssignments, setGridAssignments] = useState<Record<string, string[]>>({})
  
  useEffect(() => {
    if (!supabase) return

    const client = supabase

    let ignore = false
    async function fetchGrids() {
      const { data } = await client.from('home_grids').select('product_id, grid')
      if (!ignore && data) {
        const map: Record<string, string[]> = {}
        for (const row of data) {
          if (!map[row.product_id]) map[row.product_id] = []
          map[row.product_id].push(row.grid)
        }
        setGridAssignments(map)
      }
    }
    fetchGrids()
    return () => { ignore = true }
  }, [products, supabase])

  async function handleToggleGrid(product: Product, grid: string, assign: boolean) {
    if (!supabase) return alert('Supabase client not available')
    const client = supabase
    try {
      console.log('Toggling grid:', { productId: product.id, grid, assign })
      let result
      if (assign) {
        result = await client.from('home_grids').upsert(
          { product_id: product.id, grid },
          { onConflict: 'product_id,grid' }
        )
      } else {
        result = await client.from('home_grids').delete().eq('product_id', product.id).eq('grid', grid)
      }
      if (result.error) {
        console.error('Supabase error:', result.error)
        alert('Failed to update grid assignment: ' + result.error.message)
        return
      }
      // Always refetch assignments from backend for consistency
      const { data, error } = await client.from('home_grids').select('product_id, grid')
      if (error) {
        console.error('Supabase fetch error:', error)
        alert('Failed to fetch updated grid assignments: ' + error.message)
        return
      }
      const map: Record<string, string[]> = {}
      for (const row of data || []) {
        if (!map[row.product_id]) map[row.product_id] = []
        map[row.product_id].push(row.grid)
      }
      setGridAssignments(map)
    } catch (err) {
      console.error('JS error:', err)
      alert('Failed to update grid assignment. Please try again.')
    }
  }
  const [editing, setEditing] = useState<Product | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | 'all'>('all')
  const [onlyActive, setOnlyActive] = useState(false)
  const [onlyOOS, setOnlyOOS] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [apiError, setApiError] = useState<{ code?: number; message?: string } | null>(null)

  useEffect(() => {
  if (!supabase) return;
  const client = supabase
  let ignore = false
    async function fetchCount() {
      try {
        let headers: Record<string, string> | undefined
        try {
      const sess = await client.auth.getSession()
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
  }, [supabase])

  const inStockCount = useMemo(() => products.filter(p => p.active !== false).length, [products])
  const oosCount = useMemo(() => products.filter(p => p.active === false).length, [products])

  const filtered = useMemo(() => {
    let list = products
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (onlyActive) list = list.filter((p) => p.active !== false)
    if (onlyOOS) list = list.filter((p) => p.active === false)
    return list
  }, [products, query, category, onlyActive, onlyOOS])

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
      await add({ ...data, created_at: new Date().toISOString() })
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
              <input type="checkbox" checked={onlyActive} onChange={(e) => { setOnlyActive(e.target.checked); if (e.target.checked) setOnlyOOS(false) }} />
              In Stock ({inStockCount})
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyOOS} onChange={(e) => { setOnlyOOS(e.target.checked); if (e.target.checked) setOnlyActive(false) }} />
              Out of Stock ({oosCount})
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <details className="group">
              <summary className="list-none inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer select-none">
                Inventory Actions
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8l4 4 4-4"/></svg>
              </summary>
              <div className="absolute z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg p-1 text-sm">
                <button
                  type="button"
                  onClick={() => filtered.filter(p => p.active === false).forEach(p => update({ ...p, active: true }))}
                  disabled={!filtered.some(p => p.active === false)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Mark Out of Stock as In Stock
                </button>
                <button
                  type="button"
                  onClick={() => filtered.filter(p => p.active !== false).forEach(p => update({ ...p, active: false }))}
                  disabled={!filtered.some(p => p.active !== false)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Mark In Stock as Out of Stock
                </button>
                <div className="my-1 h-px bg-gray-100" />
                <button
                  type="button"
                  onClick={() => { filtered.forEach(p => update({ ...p, active: true })) }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Force All Filtered In Stock
                </button>
                <button
                  type="button"
                  onClick={() => { filtered.forEach(p => update({ ...p, active: false })) }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> Force All Filtered Out of Stock
                </button>
              </div>
            </details>
          </div>
          <p className="text-xs text-gray-500">Quick bulk updates apply only to rows in the current filtered list.</p>
        </div>
        <ProductTable
          products={filtered}
          onEdit={openEdit}
          onDelete={(id) => remove(id)}
          onToggleActive={(p, active) => update({ ...p, active })}
          gridAssignments={gridAssignments}
          onToggleGrid={handleToggleGrid}
          isAdmin={isAdmin}
        />
      </section>

      <Modal isOpen={isOpen} onClose={closeModal} title={editing ? 'Edit Product' : 'Add Product'}>
        <ProductForm product={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
