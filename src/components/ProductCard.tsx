"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/products'
import { useCart } from '@/lib/cart'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  return (
    <article className="card card-hover overflow-hidden">
      <div className="relative aspect-[4/3] sm:aspect-[5/4] bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          priority
        />
        {/* Accent badge */}
        <div className="absolute left-3 top-3">
          <span className="badge bg-accent text-gray-900">Free delivery 50+</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {/* Ratings (simple visual from tags length for demo) */}
        <div className="mt-1 flex items-center gap-1 text-amber-500" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < Math.min(5, product.tags.length) ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
          ))}
          <span className="ml-1 text-xs text-gray-500">({Math.max(12, product.tags.length * 23)})</span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-end justify-between">
          <div className="leading-none">
            <div className="text-2xl font-extrabold tracking-tight">${product.price.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Incl. VAT</div>
          </div>
          <button className="btn btn-primary" onClick={() => add(product)} aria-label={`Add ${product.name} to cart`}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
