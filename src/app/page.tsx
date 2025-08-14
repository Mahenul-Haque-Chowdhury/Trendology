import CatalogGrid from '@/components/catalog/CatalogGrid'
import AdvertiseBanner from '@/components/AdvertiseBanner'

export default function HomePage() {
  return (
    <div className="space-y-10">
  <AdvertiseBanner />

      <section id="products">
  <h2 className="section-title">Featured products</h2>
        <CatalogGrid />
      </section>
    </div>
  )
}
