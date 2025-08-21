"use client"
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/products'

export default function SimpleGrid({ products, limit }: { products: Product[]; limit?: number }) {
  const list = typeof limit === 'number' ? products.slice(0, Math.max(0, limit)) : products
  if (!list || list.length === 0) {
    return <p className="text-gray-600">No products available.</p>
  }
  return (
    <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {list.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
