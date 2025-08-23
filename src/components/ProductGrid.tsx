"use client"
import { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'
import { StaggerGrid } from './Reveal'
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
  const [sort, setSort] = useState<'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'name-asc' | 'name-desc'>('relevance')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      : products

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'oldest') list = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    if (sort === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name))


    return list
  }, [products, query, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex-1 flex flex-row gap-2 items-center">
          <div className="text-sm text-gray-600 py-2">{filtered.length} product{filtered.length === 1 ? '' : 's'}</div>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-auto md:w-56 border rounded-md px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Sort: Price (Low to High)</option>
          <option value="price-desc">Sort: Price (High to Low)</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
        </select>
      </div>

  {filtered.length === 0 ? (
        <p className="text-gray-600">No products match your search.</p>
      ) : (
        <StaggerGrid className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </StaggerGrid>
      )}
    </div>
  )
}