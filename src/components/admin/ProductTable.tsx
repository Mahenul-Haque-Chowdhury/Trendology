import type { Product } from '@/lib/products'
import { formatCurrencyBDT } from '@/lib/currency'

// Simple inline icons; consider lucide-react for production-grade icons
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
)
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
)

export type ProductTableProps = {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleActive: (product: Product, active: boolean) => void
  gridAssignments: Record<string, string[]> // productId -> grid[]
  onToggleGrid: (product: Product, grid: string, assigned: boolean) => void
  isAdmin?: boolean
}

const GRIDS = ["bestsellers", "new", "budget", "premium"] as const;

export default function ProductTable({ products, onEdit, onDelete, onToggleActive, gridAssignments, onToggleGrid, isAdmin }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Product</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Price</th>
            <th scope="col" className="px-6 py-3">Stock</th>
            <th scope="col" className="px-6 py-3">Homepage Grids</th>
            <th scope="col" className="px-6 py-3">Interest</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-500">No products found.</td>
            </tr>
          )}
          {products.map((p) => (
            <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-gray-100" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 truncate">ID: {p.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{p.category}</td>
              <td className="px-6 py-4">{formatCurrencyBDT(p.price)}</td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => onToggleActive(p, p.active === false)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition shadow-sm border w-32
                    ${p.active !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
                  title={p.active !== false ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {p.active !== false ? 'In Stock' : 'Out of Stock'}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? (
                    GRIDS.map((grid) => {
                      const assigned = (gridAssignments && gridAssignments[p.id]?.includes(grid)) || false
                      return (
                        <button
                          key={grid}
                          className={`px-2 py-1 rounded text-xs font-semibold border ${assigned ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'} transition`}
                          onClick={() => onToggleGrid(p, grid, !assigned)}
                          type="button"
                          title={assigned ? `Remove from ${grid}` : `Add to ${grid}`}
                        >
                          {grid === 'bestsellers' ? 'Best Sellers' : grid.charAt(0).toUpperCase() + grid.slice(1)}
                        </button>
                      )
                    })
                  ) : (
                    GRIDS.map((grid) => {
                      const assigned = (gridAssignments && gridAssignments[p.id]?.includes(grid)) || false
                      return assigned ? (
                        <span key={grid} className="px-2 py-1 rounded text-xs font-semibold border bg-gray-200 text-gray-700 border-gray-300">
                          {grid === 'bestsellers' ? 'Best Sellers' : grid.charAt(0).toUpperCase() + grid.slice(1)}
                        </span>
                      ) : null
                    })
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <RestockInterest productId={p.id} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button className="btn btn-sm btn-ghost" title="Edit" onClick={() => onEdit(p)}>
                    <EditIcon />
                  </button>
                  <button className="btn btn-sm btn-ghost text-red-500" title="Delete" onClick={() => onDelete(p.id)}>
                    <DeleteIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Inline component to display restock interest count & details modal
import { useState, useEffect } from 'react'
function RestockInterest({ productId }: { productId: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    let ignore = false
    async function loadCount() {
      try {
        const res = await fetch(`/api/admin/restock-requests?product_id=${encodeURIComponent(productId)}`)
        const json = await res.json()
        if (!ignore && json.ok) {
          setCount(Array.isArray(json.items) ? json.items.length : 0)
        }
      } catch {}
    }
    loadCount()
  }, [productId])

  const openModal = async () => {
    setOpen(true)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/restock-requests?product_id=${encodeURIComponent(productId)}`)
      const json = await res.json()
      if (json.ok) setRows(json.items)
    } catch {}
    setLoading(false)
  }

  if (count === null) return <span className="text-xs text-gray-400">…</span>
  if (count === 0) return <span className="text-xs text-gray-400">None</span>
  return (
    <>
      <button onClick={openModal} className="text-xs font-medium text-emerald-700 hover:underline">
        {count} request{count > 1 ? 's' : ''}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-5 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Restock Requests</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {loading ? (
              <div className="text-xs text-gray-500">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-xs text-gray-500">No requests.</div>
            ) : (
              <ul className="max-h-60 overflow-auto divide-y border rounded-md">
                {rows.map(r => (
                  <li key={r.id} className="text-xs px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-medium truncate" title={r.email || r.user_id}>{r.email || r.user_id}</span>
                    <span className="text-[10px] text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}
