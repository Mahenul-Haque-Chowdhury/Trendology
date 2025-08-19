"use client"
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist'
import { useProductRating } from '@/lib/reviews'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const wishlist = useWishlist()
  const { avg, count } = useProductRating(product.id)
  return (
    <article className="card card-hover overflow-hidden">
  <div className="relative aspect-[3/2] sm:aspect-[5/4] bg-gray-50">
        <Link href={`/products/${product.id}`} aria-label={`Open ${product.name}`} className="absolute inset-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            priority
          />
        </Link>
        {/* Accent badge */}
        <div className="absolute left-3 top-3">
          <span className="badge bg-accent text-gray-900">Free delivery 50+</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-snug line-clamp-2">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {/* Ratings (live from Supabase with fallback) */}
        <div className="mt-1 flex items-center gap-1 text-amber-500" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => {
            const rounded = Math.max(0, Math.min(5, Math.round(avg || 0)))
            const filled = i < (rounded || Math.min(5, product.tags.length))
            return (
              <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
            )
          })}
          <span className="ml-1 text-xs text-gray-500">({count || Math.max(12, product.tags.length * 23)})</span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        {/* Footer row: price + wishlist on the left, Add to cart on the right */}
        <div className="mt-4 flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="leading-none h-10 sm:h-12 flex flex-col justify-end">
              <div className="text-lg sm:text-xl font-extrabold tracking-tight whitespace-nowrap shrink-0 min-w-[96px]">{formatCurrencyBDT(product.price)}</div>
            </div>
            <button
              className={`rounded-full p-2 border ${wishlist.has(product.id) ? 'bg-red-500 text-white border-red-500' : 'hover:bg-gray-100'}`}
              aria-label={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={async () => {
                try {
                  await wishlist.toggle(product)
                } catch (e: any) {
                  if (String(e.message) === 'LOGIN_REQUIRED') {
                    alert('Please sign in to use wishlist.')
                  }
                }
              }}
              title={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {/* Heart icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.88.5 9.5.5 6.462 2.962 4 6 4c1.657 0 3.156.81 4.1 2.053C11.844 4.81 13.343 4 15 4c3.038 0 5.5 2.462 5.5 5.5 0 1.38-.36 2.726-2.072 4.438C18.716 16.65 12 21 12 21z"/></svg>
            </button>
          </div>
          <button className="btn btn-primary btn-sm shrink-0 w-[120px] sm:w-[136px] h-10" onClick={() => add(product)} aria-label={`Add ${product.name} to cart`}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
