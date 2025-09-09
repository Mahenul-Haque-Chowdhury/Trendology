"use client"
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatCurrencyBDT } from '@/lib/currency'
import { Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { useFavorites } from '@/lib/favorites'
import { useWishlist } from '@/lib/wishlist'
import { useProductRating } from '@/lib/reviews'
import { useToast } from './ToastStack'

interface ProductCardProps { product: Product; variant?: 'default' | 'compact' }

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { add, setOpen, remove: removeFromCart } = useCart()
  const favorites = useFavorites()
  const wishlist = useWishlist()
  const [favPending, setFavPending] = useState<boolean>(false)
  const { avg, count } = useProductRating(product.id)
  const { push } = useToast()

  const handleAdd = () => {
    add(product, 1, { openDrawer: false })
    push({
      title: 'Great! Item Added to Cart',
      message: `"${product.name}" added to cart`,
      actionLabel: 'Go to Cart',
      onAction: () => setOpen(true),
      dismissLabel: 'Remove',
      onDismiss: () => removeFromCart(product.id),
      variant: 'success',
      duration: 6000
    })
  }

  return (
  <motion.article
    layout
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.97 }}
    className={`relative group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${variant==='compact'?'':'h-full flex flex-col'}`}
  >
    {/* Image wrapper */}
  <div className={`relative ${variant==='compact'?'aspect-[4/3]':'aspect-[3/2] sm:aspect-[5/4]'} bg-gray-100 overflow-hidden`}>      
      <Link href={`/products/${product.id}`} aria-label={`Open ${product.name}`} className="absolute inset-0">
        <Image src={product.image} alt={product.name} fill sizes="(max-width:640px)50vw,(max-width:1024px)33vw,25vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out" />
      </Link>
      {/* Top-left badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {product.active === false && (
          <span className="px-2 py-1 rounded-md bg-rose-600 text-white text-[11px] font-semibold shadow-sm">Out of Stock</span>
        )}
        <span className="px-2 py-1 rounded-md bg-white/95 text-[11px] font-semibold tracking-wide shadow-sm ring-1 ring-gray-200">New</span>
        {typeof product.compare_at_price === 'number' && product.compare_at_price > product.price && (
          <span className="px-2 py-1 rounded-md bg-rose-600 text-white text-[11px] font-semibold shadow-sm">-{Math.round(((product.compare_at_price - product.price)/product.compare_at_price)*100)}%</span>
        )}
      </div>
      {variant !== 'compact' && (
        product.active === false ? (
          <button
            disabled={favPending}
            onClick={async () => {
              if (favPending) return
              const already = wishlist.has(product.id)
              setFavPending(true)
              try {
                await wishlist.toggle(product)
                push({
                  title: already ? 'Removed from Wishlist' : 'Added to Wishlist',
                  message: `"${product.name}" ${already ? 'removed' : 'saved (out of stock)'}`,
                  variant: 'success',
                  duration: 4000
                })
              } catch (e:any) {
                if (String(e.message) === 'LOGIN_REQUIRED') {
                  alert('Please sign in to save wishlist.')
                } else {
                  console.warn('Wishlist toggle failed', e)
                  push({ title: 'Action Failed', message: 'Could not update wishlist', variant: 'error', duration: 4000 })
                }
              } finally {
                setFavPending(false)
              }
            }}
            aria-label={wishlist.has(product.id)?'Remove from wishlist':'Add to wishlist'}
            aria-busy={favPending || undefined}
            className={`absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center border border-gray-200 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-60 disabled:cursor-not-allowed ${wishlist.has(product.id)?'text-red-500':'text-gray-700 hover:text-red-500'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" className={favPending ? 'animate-pulse' : ''} fill={wishlist.has(product.id)?'currentColor':'none'} stroke="currentColor" strokeWidth="1.4"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.88.5 9.5.5 6.462 2.962 4 6 4c1.657 0 3.156.81 4.1 2.053C11.844 4.81 13.343 4 15 4c3.038 0 5.5 2.462 5.5 5.5 0 1.38-.36 2.726-2.072 4.438C18.716 16.65 12 21 12 21z" /></svg>
          </button>
        ) : (
          <button
            disabled={favPending}
            onClick={async () => {
              if (favPending) return
              const already = favorites.has(product.id)
              setFavPending(true)
              try {
                await favorites.toggle(product)
                push({
                  title: already ? 'Removed from Favorites' : 'Saved to Favorites',
                  message: `"${product.name}" ${already ? 'removed' : 'saved for later checkout'}`,
                  variant: 'success',
                  duration: 4000
                })
              } catch (e:any) {
                if (String(e.message) === 'LOGIN_REQUIRED') {
                  alert('Please sign in to save favorites.')
                } else {
                  console.warn('Favorite toggle failed', e)
                  push({ title: 'Action Failed', message: 'Could not update favorites', variant: 'error', duration: 4000 })
                }
              } finally {
                setFavPending(false)
              }
            }}
            aria-label={favorites.has(product.id)?'Remove from favorites':'Add to favorites'}
            aria-busy={favPending || undefined}
            className={`absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center border border-gray-200 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-60 disabled:cursor-not-allowed ${favorites.has(product.id)?'text-red-500':'text-gray-700 hover:text-red-500'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" className={favPending ? 'animate-pulse' : ''} fill={favorites.has(product.id)?'currentColor':'none'} stroke="currentColor" strokeWidth="1.4"><path d="M12 21s-6.716-4.35-9.428-7.062C.86 12.226.5 10.88.5 9.5.5 6.462 2.962 4 6 4c1.657 0 3.156.81 4.1 2.053C11.844 4.81 13.343 4 15 4c3.038 0 5.5 2.462 5.5 5.5 0 1.38-.36 2.726-2.072 4.438C18.716 16.65 12 21 12 21z" /></svg>
          </button>
        )
      )}
      {/* Hover action buttons (desktop) */}
      {variant !== 'compact' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-row items-center justify-center gap-3 px-4 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-20">
          {product.active === false ? (
            <button
              disabled={favPending}
              onClick={async () => {
                if (favPending) return
                const already = wishlist.has(product.id)
                setFavPending(true)
                try {
                  await wishlist.toggle(product)
                  push({ title: already ? 'Removed from Wishlist' : 'Added to Wishlist', message: `"${product.name}" ${already ? 'removed' : 'saved (out of stock)'}`, variant: 'success', duration: 4000 })
                } catch (e:any) {
                  if (String(e.message) === 'LOGIN_REQUIRED') alert('Please sign in to save wishlist.')
                  else push({ title: 'Action Failed', message: 'Could not update wishlist', variant: 'error', duration: 4000 })
                } finally { setFavPending(false) }
              }}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-rose-600 text-white px-5 h-11 min-w-[140px] whitespace-nowrap text-sm font-semibold shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500/60 transition disabled:opacity-60"
            >{wishlist.has(product.id) ? 'Wishlisted' : 'Add to Wishlist'}</button>
          ) : (
            <button
              onClick={handleAdd}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-brand text-white px-5 h-11 min-w-[130px] whitespace-nowrap text-sm font-semibold shadow-[0_4px_18px_-2px_rgba(15,160,153,0.45)] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/60 transition"
            >Add to Cart</button>
          )}
          <Link
            href={`/products/${product.id}`}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white px-5 h-11 min-w-[120px] whitespace-nowrap text-sm font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/60 transition border border-gray-200 text-gray-900"
          >View Details</Link>
        </div>
      )}
      {/* Removed darkening overlay for solid button aesthetic */}
    </div>
    {/* Content */}
    <div className={`flex flex-col ${variant==='compact'?'p-3 gap-1.5':'p-4 gap-2 flex-1'}`}>
      <h3 className={`font-semibold leading-snug line-clamp-2 ${variant==='compact'?'text-sm':'text-base'} text-gray-900 dark:text-gray-100`}>
        <Link href={`/products/${product.id}`} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      {variant !== 'compact' && (
        <div className="flex items-center gap-1 text-amber-500" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => {
            const rounded = Math.max(0, Math.min(5, Math.round(avg || 0)))
            const filled = i < (rounded || Math.min(5, product.tags.length))
            return <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={filled?'currentColor':'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z" /></svg>
          })}
          <span className="ml-1 text-[11px] text-gray-500">({count || Math.max(12, product.tags.length * 23)})</span>
        </div>
      )}
      <div className="flex items-center gap-3 mt-auto">
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight ${variant==='compact'?'text-[15px]':'text-lg'} text-gray-900 dark:text-gray-100`}>{formatCurrencyBDT(product.price)}</span>
          {typeof product.compare_at_price === 'number' && product.compare_at_price > product.price && (
            <span className="text-[11px] line-through text-gray-400">{formatCurrencyBDT(product.compare_at_price || 0)}</span>
          )}
        </div>
        {variant==='compact' && (
          <button
            onClick={handleAdd}
            className="ml-auto inline-flex items-center justify-center rounded-md bg-brand text-white h-8 px-3 text-xs font-semibold hover:bg-brand/90 transition"
            aria-label={`Add ${product.name} to cart`}
          >Add</button>
        )}
      </div>
      {variant !== 'compact' && (
        <div className="flex items-center gap-2 pt-3 sm:hidden">
          {product.active === false ? (
            <button
              disabled={favPending}
              onClick={async () => {
                if (favPending) return
                const already = wishlist.has(product.id)
                setFavPending(true)
                try {
                  await wishlist.toggle(product)
                  push({ title: already ? 'Removed from Wishlist' : 'Added to Wishlist', message: `"${product.name}" ${already ? 'removed' : 'saved (out of stock)'}`, variant: 'success', duration: 4000 })
                } catch (e:any) {
                  if (String(e.message) === 'LOGIN_REQUIRED') alert('Please sign in to save wishlist.')
                  else push({ title: 'Action Failed', message: 'Could not update wishlist', variant: 'error', duration: 4000 })
                } finally { setFavPending(false) }
              }}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-rose-600 text-white h-10 text-sm font-semibold shadow hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500/60 transition disabled:opacity-60"
              aria-label={`Add ${product.name} to wishlist`}
            >{wishlist.has(product.id) ? 'Wishlisted' : 'Add to Wishlist'}</button>
          ) : (
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-brand text-white h-10 text-sm font-semibold shadow hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/60 transition"
              aria-label={`Add ${product.name} to cart`}
            >Add to Cart</button>
          )}
          <Link
            href={`/products/${product.id}`}
            className="flex-1 inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-10 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/60 transition"
            aria-label={`View details for ${product.name}`}
          >Details</Link>
        </div>
      )}
    </div>
  </motion.article>
  )
}
