import CatalogGrid from '@/components/catalog/CatalogGrid'
import CategoryStrip from '@/components/CategoryStrip'
import HomeGrids from '@/components/HomeGrids'
import AdvertiseBannerDeals from '@/components/AdvertiseBannerDeals'
import AdvertiseBannerSeason from '@/components/AdvertiseBannerSeason'
import Image from 'next/image'
// Composite hero with left main banner + payment methods, and two right-side advertise banners
export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero row */}
      <section className="grid gap-4 md:gap-6 md:grid-cols-3">
        {/* Left hero card (border only) with payment methods */}
        <div className="relative overflow-hidden rounded-2xl bg-white border md:col-span-2">
          <div className="px-6 sm:px-10 py-8 sm:py-12">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900">Minimal store. Maximum comfort.</h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600">Carefully curated products with a clean, distraction-free shopping experience.</p>
              <div className="mt-6 flex items-center gap-3">
                <a href="#products" className="btn btn-primary">Shop now</a>
                <a href="#categories" className="btn">Browse categories</a>
              </div>
            </div>

            {/* Payment methods strip */}
            <div className="mt-8 border-t pt-5">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="hidden sm:inline">We accept</span>
                <div className="flex items-center gap-4">
                  <Image src="/logos/bkash.webp" alt="bKash" width={64} height={24} className="h-6 w-auto" />
                  <Image src="/logos/nagad.webp" alt="Nagad" width={64} height={24} className="h-6 w-auto" />
                  <Image src="/logos/rocket.png" alt="Rocket" width={64} height={24} className="h-6 w-auto" />
                  <Image src="/logos/upay.webp" alt="Upay" width={64} height={24} className="h-6 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: two stacked advertise banners */}
        <div className="grid gap-4 sm:gap-6">
          <AdvertiseBannerDeals size="sm" />
          <AdvertiseBannerSeason size="sm" />
        </div>
      </section>

      {/* Featured first */}
      <section id="products" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold">Featured products</h2>
        </div>
        <CatalogGrid />
      </section>

      {/* Categories under featured */}
      <section id="categories" aria-label="Browse categories" className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Shop by category</h2>
        <CategoryStrip />
      </section>

      {/* Other product sections (excluding featured to avoid mixing) */}
      <section aria-label="More products" className="space-y-10">
        <HomeGrids include={['new', 'budget', 'premium']} />
      </section>
    </div>
  )
}
