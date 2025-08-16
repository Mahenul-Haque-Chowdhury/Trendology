"use client"
import ImageGallery from '@/components/ImageGallery'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'
import { useProductReviews } from '@/lib/reviews'
import { useProductQnA } from '@/lib/qna'
import { useState } from 'react'

export default function ProductPage({ params }: { params: { id: string } }) {
  const { products } = useCatalog()
  // Always call hooks in the same order every render to satisfy React rules
  const { reviews, stats, add: addReview } = useProductReviews(params.id)
  const { items: qna, ask } = useProductQnA(params.id)
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc')

  const product = products.find((p) => p.id === params.id)
  if (!product) return <div className="container py-10">Product not found.</div>

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image]
  const related = products.filter((p) => p.category === product.category && p.id !== product.id)

  return (
    <div className="space-y-10">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 items-start">
        <ImageGallery images={gallery} alt={product.name} />
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-6">
            <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
            <AddToCartButton product={product} />
          </div>

          {/* Delivery Options and Payments */}
          <section className="pt-2">
            <h3 className="text-lg font-semibold">Delivery Options</h3>
            <hr className="my-2" />
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><span>📍</span><span><span className="font-medium">Available Delivery Area:</span> All over Bangladesh.</span></li>
              <li className="flex items-start gap-2"><span>📍</span><span><span className="font-medium">Dhaka</span> <span className="text-gray-700">• Dhaka City North</span> <button className="text-brand font-medium ml-2 hover:underline" type="button">Change</button></span></li>
              <li>
                <div className="font-medium">Delivery Info</div>
                <div className="text-gray-600">
                  <div>Delivery Time: Inside Dhaka: 2–3 working days · Outside Dhaka: 3–7 working days</div>
                  <div>Shipping Charge: Inside Dhaka $70.00 · Outside Dhaka $130.00</div>
                </div>
              </li>
              <li className="space-y-2">
                <div className="font-medium">Cash on Delivery Available</div>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Payment service icons (no card logos) */}
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded border">
                    <span className="text-pink-600 font-semibold">bKash</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded border">
                    <span className="text-orange-600 font-semibold">Nagad</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded border">
                    <span className="text-amber-600 font-semibold">Rocket</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded border">
                    <span className="text-emerald-600 font-semibold">Upay</span>
                  </span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

  {/* Tabs: Description, Reviews, Q&A */}
      <section className="space-y-4">
        <div className="flex items-center gap-8 border-b">
          {[
            { key: 'desc', label: 'Description' },
            { key: 'reviews', label: `Customer Reviews (${stats.count})` },
            { key: 'qa', label: 'Question & Answer' },
          ].map((t) => (
            <button
              key={t.key}
              className={`py-3 -mb-px border-b-2 ${activeTab === t.key ? 'border-brand text-black font-semibold' : 'border-transparent text-gray-500 hover:text-black'}`}
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
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold">{stats.avg.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average rating · {stats.count} review(s)</div>
            </div>
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget as HTMLFormElement)
                const rating = Number(fd.get('rating') || '5')
                const title = String(fd.get('title') || '')
                const body = String(fd.get('body') || '')
                try { await addReview(rating, title, body); (e.currentTarget as HTMLFormElement).reset() } catch (err: any) { alert(err.message || String(err)) }
              }}
            >
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-6">
                <select name="rating" className="border rounded-md px-3 py-2 sm:col-span-2">
                  {[5,4,3,2,1].map(r => (<option key={r} value={r}>{r} star{r>1?'s':''}</option>))}
                </select>
                <input name="title" placeholder="Title" className="border rounded-md px-3 py-2 sm:col-span-4" />
              </div>
              <textarea name="body" rows={3} placeholder="Write your review (optional)" className="border rounded-md px-3 py-2 w-full" />
              <button className="btn btn-primary">Submit Review</button>
            </form>
            <ul className="divide-y">
              {reviews.map(r => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center gap-2 text-amber-500" aria-label={`Rating ${r.rating}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < r.rating ? 'currentColor' : 'none'} stroke="currentColor"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.954L10 0l2.951 5.956 6.561.954-4.756 4.635 1.122 6.545z"/></svg>
                    ))}
                  </div>
                  {r.title ? <div className="font-medium">{r.title}</div> : null}
                  {r.body ? <div className="text-sm text-gray-700">{r.body}</div> : null}
                  <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
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
                const fd = new FormData(e.currentTarget as HTMLFormElement)
                const q = String(fd.get('question') || '')
                if (!q.trim()) return
                try { await ask(q); (e.currentTarget as HTMLFormElement).reset() } catch (err: any) { alert(err.message || String(err)) }
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
