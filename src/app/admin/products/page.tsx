"use client"
import { useCatalog } from '@/lib/catalog'
import { useState } from 'react'
import type { Product } from '@/lib/products'

export default function AdminProductsPage() {
  const { products, add, update, remove, categories } = useCatalog()
  const [editing, setEditing] = useState<Product | null>(null)

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
  }

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
          <input name="image" placeholder="Main image URL" defaultValue={editing?.image} className="border rounded-md px-3 py-2 sm:col-span-2" />
          <input name="images" placeholder="Extra image URLs (comma separated)" defaultValue={editing?.images?.join(', ')} className="border rounded-md px-3 py-2 sm:col-span-2" />
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
        <h2 className="text-lg font-semibold mb-3">All Products ({products.length})</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="border rounded-md p-3 space-y-2">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-gray-600 truncate">{p.category} · ${p.price.toFixed(2)}</div>
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
