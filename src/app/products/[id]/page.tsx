"use client"
import ImageGallery from '@/components/ImageGallery'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'

export default function ProductPage({ params }: { params: { id: string } }) {
  const { products } = useCatalog()
  const product = products.find((p) => p.id === params.id)
  if (!product) return <div>Product not found.</div>

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image]
  const related = products.filter((p) => p.category === product.category && p.id !== product.id)

  return (
    <div className="space-y-10">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 items-start">
        <ImageGallery images={gallery} alt={product.name} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-6">
            <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Related Products</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
