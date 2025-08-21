"use client"
import { useCatalog } from '@/lib/catalog'
import ProductGrid from '@/components/ProductGrid'
import HomeHero from '@/components/HomeHero'

export default function Page() {
  const { products } = useCatalog()
  return (
    <div className="space-y-10">
      <HomeHero />
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <ProductGrid products={products} />
    </div>
  )
}
