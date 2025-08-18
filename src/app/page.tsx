import CatalogGrid from '@/components/catalog/CatalogGrid'
import AdvertiseBanner from '@/components/AdvertiseBanner'
import CategoryStrip from '@/components/CategoryStrip'

export default function HomePage() {
  return (
  <div className="space-y-8 sm:space-y-10">
  <AdvertiseBanner />

      <section aria-label="Browse categories" className="mt-2">
        <CategoryStrip />
      </section>

  <section id="products">
  <h2 className="section-title">Featured products</h2>
        <CatalogGrid />
      </section>
    </div>
  )
}
