"use client"
import { useMemo } from 'react'
import { useCatalog } from '@/lib/catalog'
import SimpleGrid from '@/components/catalog/SimpleGrid'

type Section = 'featured' | 'new' | 'budget' | 'premium'

export default function HomeGrids({ include, limit = 12 }: { include?: Section[]; limit?: number }) {
  const { products } = useCatalog()

  const active = useMemo(() => products.filter((p) => p.active !== false), [products])

  const byIdDesc = useMemo(() => {
    return [...active].sort((a, b) => {
      // Try to sort by numeric id when possible, else fall back to string desc
      const na = Number(a.id)
      const nb = Number(b.id)
      if (Number.isFinite(na) && Number.isFinite(nb)) return nb - na
      return String(b.id).localeCompare(String(a.id))
    })
  }, [active])

  const byPriceAsc = useMemo(() => [...active].sort((a, b) => a.price - b.price), [active])
  const byPriceDesc = useMemo(() => [...active].sort((a, b) => b.price - a.price), [active])

  const sections: Section[] = include && include.length > 0 ? include : ['featured', 'new', 'budget', 'premium']

  return (
    <div className="space-y-10">
      {sections.includes('featured') && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">Featured products</h2>
          </div>
          <SimpleGrid products={active} limit={limit} />
        </section>
      )}

      {sections.includes('new') && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">New arrivals</h2>
          </div>
          <SimpleGrid products={byIdDesc} limit={limit} />
        </section>
      )}

      {sections.includes('budget') && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">Budget picks</h2>
          </div>
          <SimpleGrid products={byPriceAsc} limit={limit} />
        </section>
      )}

      {sections.includes('premium') && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">Premium picks</h2>
          </div>
          <SimpleGrid products={byPriceDesc} limit={limit} />
        </section>
      )}
    </div>
  )
}
