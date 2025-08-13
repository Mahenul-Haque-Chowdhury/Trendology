import CatalogGrid from '@/components/catalog/CatalogGrid'

export default function HomePage() {
  return (
    <div className="space-y-10">
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#fff" d="M35.7,-52.6C47.8,-44.1,59.6,-35,64.3,-23.5C69,-12.1,66.6,1.8,60.6,14.5C54.6,27.1,45.1,38.5,33.7,46.7C22.3,54.8,9.1,59.7,-3.2,64C-15.5,68.2,-31.1,71.8,-44.1,66.8C-57.1,61.8,-67.5,48.2,-72.7,33.1C-77.9,18,-77.9,1.4,-72.9,-13.2C-67.8,-27.8,-57.6,-40.3,-45.6,-49.2C-33.6,-58,-19.8,-63.3,-6,-60.9C7.9,-58.5,15.7,-48.4,35.7,-52.6Z" transform="translate(100 100)" />
          </svg>
        </div>
        <div className="relative px-6 sm:px-10 py-14 sm:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">A marketplace for everything</h1>
          <p className="opacity-90 max-w-2xl mx-auto">Shop curated products across categories with fast checkout and friendly UI.</p>
          <div className="mt-6 flex justify-center">
    <a href="#products" className="btn btn-accent">Browse featured</a>
          </div>
        </div>
      </section>

      <section id="products">
  <h2 className="section-title">Featured products</h2>
        <CatalogGrid />
      </section>
    </div>
  )
}
