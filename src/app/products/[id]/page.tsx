"use client"
import ImageGallery from '@/components/ImageGallery'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'
import { useProductReviews } from '@/lib/reviews'
import { useProductQnA } from '@/lib/qna'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { formatCurrencyBDT } from '@/lib/currency'
import LocationSelector from '@/components/LocationSelector'
import { useUserLocation } from '@/lib/userLocation'

export default function ProductPage({ params }: { params: { id: string } }) {
  const { products } = useCatalog()
  // Always call hooks in the same order every render to satisfy React rules
  const { reviews, stats, add: addReview } = useProductReviews(params.id)
  const { items: qna, ask } = useProductQnA(params.id)
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc')
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [starFilter, setStarFilter] = useState<number | 'all'>('all')
  const filteredReviews = useMemo(() => (starFilter === 'all' ? reviews : reviews.filter(r => r.rating === starFilter)), [reviews, starFilter])

  const product = products.find((p) => p.id === params.id)
  const { location, isDhaka, shipping } = useUserLocation()
  if (!product) return <div className="container py-10">Product not found.</div>

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image]
  const related = products.filter((p) => p.category === product.category && p.id !== product.id)

  return (
    <div className="space-y-12">
      <div className="grid gap-10 grid-cols-1 lg:grid-cols-12 items-start">
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          <ImageGallery images={gallery} alt={product.name} />
        </div>
        <div className="lg:col-span-6 xl:col-span-5 space-y-6 lg:sticky lg:top-[calc(var(--site-header-height,4rem)+1rem)]">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">{product.category}</span>
              <span>{stats.count} review{stats.count===1?'':'s'}</span>
            </div>
          </div>
          <div className="flex items-end gap-6 flex-wrap">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900">{formatCurrencyBDT(product.price)}</span>
            <AddToCartButton product={product} />
          </div>
          <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
          {/* Feature tags */}
          {product.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map(t => (
                <li key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{t}</li>
              ))}
            </ul>
          )}
          {/* Delivery Options and Payments */}
          <section className="pt-2 space-y-6">
            {/* Delivery Options */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">Delivery Options</h3>
              <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-lg" role="img" aria-label="location">📍</span>
                    <span className="font-medium">Available Delivery Area: <span className="font-semibold text-gray-900 dark:text-gray-100">All over Bangladesh</span>.</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg" role="img" aria-hidden="true">📍</span>
                    <span>Current Location: <strong>{location || 'Not set'}</strong>{location ? '' : ' (default shipping applied)'}</span>
                    <LocationSelector />
                  </div>
                  <div className="text-xs text-gray-500">(Setting your district tailors delivery time & charge.)</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100">Delivery Info</div>
                    <div className="text-gray-600 dark:text-gray-300 leading-snug">Delivery Time: <strong>{isDhaka ? 'Inside Dhaka: 2–3 working days' : 'Outside Dhaka: 3–7 working days'}</strong>{!isDhaka && ' (if Dhaka, 2–3 working days)'}</div>
                    <div className="text-gray-600 dark:text-gray-300">Shipping Charge: {isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'} <strong>{formatCurrencyBDT(shipping.charge)}</strong> <span className="text-xs text-gray-500">(Inside {formatCurrencyBDT(70)} · Outside {formatCurrencyBDT(130)})</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100">Return & Warranty</div>
                    <div className="text-gray-600 dark:text-gray-300 leading-snug">Cancellation, Return & Refund: <strong>Change of mind is not applicable</strong></div>
                    <div className="text-gray-600 dark:text-gray-300 leading-snug">Warranty: <strong>Not Available</strong></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Payments */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Payments</h3>
              <div className="flex items-center flex-wrap gap-2">
                {[
                  { name: 'bKash', src: '/logos/bkash.webp' },
                  { name: 'Nagad', src: '/logos/nagad.webp' },
                  { name: 'Rocket', src: '/logos/rocket.png' },
                  { name: 'Upay', src: '/logos/upay.webp' },
                ].map(pm => (
                  <span key={pm.name} className="relative h-8 w-14 flex items-center justify-center rounded-md bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden shadow-sm">
                    <Image src={pm.src} alt={pm.name} fill sizes="56px" className="object-contain p-1" />
                  </span>
                ))}
                <span className="inline-flex items-center h-8 px-3 text-xs font-medium rounded-md bg-emerald-600 text-white shadow-sm">COD</span>
              </div>
            </div>
          </section>
        </div>
      </div>

  {/* Tabs: Description, Reviews, Q&A */}
      <section className="space-y-4">
  <div className="flex items-center gap-6 border-b overflow-x-auto">
          {[
            { key: 'desc', label: 'Description' },
            { key: 'reviews', label: `Customer Reviews (${stats.count})` },
            { key: 'qa', label: 'Question & Answer' },
          ].map((t) => (
            <button
              key={t.key}
              className={`py-3 -mb-px border-b-2 text-sm sm:text-base whitespace-nowrap ${activeTab === t.key ? 'border-brand text-brand font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab(t.key as any)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'desc' && (
          <div className="prose max-w-none text-gray-700">{product.description || 'No description available.'}</div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-semibold">{stats.avg.toFixed(1)}</div>
                <div className="flex items-center text-amber-500" aria-label={`Average ${stats.avg.toFixed(1)} stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill={i < Math.round(stats.avg) ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
                  ))}
                </div>
                <div className="text-sm text-gray-600">{stats.count} review{stats.count === 1 ? '' : 's'}</div>
              </div>
              {/* Star filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 5, 4, 3, 2, 1] as const).map((s) => (
                  <button
                    key={String(s)}
                    type="button"
                    onClick={() => setStarFilter(s as any)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm ${starFilter === s ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    aria-pressed={starFilter === s}
                  >
                    {s === 'all' ? 'All' : (<>
                      <span>{s}</span>
                      <svg width="14" height="14" viewBox="0 0 20 20" className="text-amber-500" fill="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
                    </>)}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget as HTMLFormElement
                const fd = new FormData(form)
                const rating = Number(fd.get('rating') || String(ratingInput || 5))
        const title = product.name
                const body = String(fd.get('body') || '')
                try {
                  await addReview(rating, title, body)
                  form.reset()
                  setRatingInput(5)
                } catch (err: any) {
                  alert(err.message || String(err))
                }
              }}
            >
              {/* Star rating input */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-6 items-center">
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <input type="hidden" name="rating" value={ratingInput} />
                    {Array.from({ length: 5 }).map((_, i) => {
                      const idx = i + 1
                      const active = idx <= ratingInput
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRatingInput(idx)}
                          className={`p-1 rounded hover:scale-105 transition ${active ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                          aria-label={`${idx} star${idx>1?'s':''}`}
                          aria-pressed={active}
                        >
                          <svg width="22" height="22" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
                        </button>
                      )
                    })}
                  </div>
                </div>
        {/* Title is set automatically from product name */}
        <div className="text-sm text-gray-600 sm:col-span-4">Reviewing: <span className="font-medium">{product.name}</span></div>
              </div>
              <textarea name="body" rows={3} placeholder="Write your review (optional)" className="border rounded-md px-3 py-2 w-full" />
              <button className="btn btn-primary">Submit Review</button>
            </form>
            {/* Reviews list with optional star filter */}
            <ul className="grid grid-cols-1 gap-3">
              {filteredReviews.map(r => (
                <li key={r.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-500" aria-label={`Rating ${r.rating}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < r.rating ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  {r.title ? <div className="font-medium mt-1">{r.title}</div> : null}
                  {r.body ? <div className="text-sm text-gray-700 mt-0.5">{r.body}</div> : null}
                </li>
              ))}
              {reviews.length === 0 && <li className="py-6 text-sm text-gray-500">No reviews yet.</li>}
            </ul>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-4">
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget as HTMLFormElement
                const fd = new FormData(form)
                const q = String(fd.get('question') || '')
                if (!q.trim()) return
                try {
                  await ask(q)
                  form.reset()
                } catch (err: any) { alert(err.message || String(err)) }
              }}
            >
              <div className="flex items-center gap-2">
                <input name="question" placeholder="Ask a question about this product" className="border rounded-md px-3 py-2 flex-1" />
                <button className="btn btn-primary">Ask</button>
              </div>
            </form>
            <ul className="divide-y">
              {qna.map(it => (
                <li key={it.id} className="py-3">
                  <div className="text-sm text-gray-800">Q: {it.question}</div>
                  {it.answer ? (
                    <div className="text-sm text-green-700 mt-1">A: {it.answer}</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">Waiting for an answer…</div>
                  )}
                  <div className="text-xs text-gray-500">{new Date(it.created_at).toLocaleString()}</div>
                </li>
              ))}
              {qna.length === 0 && <li className="py-6 text-sm text-gray-500">No questions yet.</li>}
            </ul>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold tracking-tight">Related Products</h2>
            <span className="text-xs text-gray-500">You may also like</span>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {related.slice(0,10).map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
