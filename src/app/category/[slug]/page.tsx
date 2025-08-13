"use client"
import ProductGrid from '@/components/ProductGrid'
import { useCatalog } from '@/lib/catalog'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { products } = useCatalog()
  const list = products.filter((p) => p.category === params.slug)
  const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <ProductGrid products={list} />
    </div>
  )
}
