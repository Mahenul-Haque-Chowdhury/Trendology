"use client"
import { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/products'
import { useSearchParams } from 'next/navigation'

export default function ProductGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  // Initialize from global q param and update when it changes
  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
  }, [searchParams])
  const [sort, setSort] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance')
  const prices = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 0 }
    const vals = products.map((p) => p.price)
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [products])
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const tags = useMemo(() => Array.from(new Set(products.flatMap((p) => p.tags))).sort(), [products])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      : products

    if (minPrice !== '') list = list.filter((p) => p.price >= minPrice)
    if (maxPrice !== '') list = list.filter((p) => p.price <= maxPrice)

    if (selectedTags.length > 0) list = list.filter((p) => selectedTags.every((t) => p.tags.includes(t)))

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)

    return list
  }, [products, query, sort, minPrice, maxPrice, selectedTags])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 items-center">
            <span className="inline-flex items-center border border-brand rounded-md bg-brand text-white font-semibold text-sm px-3 py-2">Price Range</span>
            <input
              type="number"
              min={prices.min}
              max={prices.max || undefined}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Min ${prices.min}`}
              className="w-28 border rounded-md px-2 py-2 focus:border-brand focus:ring-2 focus:ring-brand"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min={prices.min}
              max={prices.max || undefined}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Max ${prices.max}`}
              className="w-28 border rounded-md px-2 py-2 focus:border-brand focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-full md:w-56 border rounded-md px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Sort: Price (Low to High)</option>
          <option value="price-desc">Sort: Price (High to Low)</option>
        </select>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const checked = selectedTags.includes(t)
            return (
              <label key={t} className={`border rounded-full px-3 py-1 text-sm cursor-pointer ${checked ? 'bg-brand text-white border-brand' : ''}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={(e) =>
                    setSelectedTags((prev) => (e.target.checked ? [...prev, t] : prev.filter((x) => x !== t)))
                  }
                />
                #{t}
              </label>
            )
          })}
        </div>
      )}

  <div className="text-sm text-gray-600">{filtered.length} result{filtered.length === 1 ? '' : 's'}</div>

  {filtered.length === 0 ? (
        <p className="text-gray-600">No products match your search.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
