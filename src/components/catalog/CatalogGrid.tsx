"use client"
import ProductGrid from '@/components/ProductGrid'
import { useCatalog } from '@/lib/catalog'
import SkeletonCard from '@/components/SkeletonCard'

export default function CatalogGrid() {
  const { products } = useCatalog()
  if (!products || products.length === 0) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  return <ProductGrid products={products} showTags={false} />
}
