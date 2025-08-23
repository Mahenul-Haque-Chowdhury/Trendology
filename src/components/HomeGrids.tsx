"use client";
import { useHomeGrids } from "@/lib/useHomeGrids"
import ProductGrid from "./ProductGrid"
import { Reveal } from './Reveal'
import Link from "next/link"

export default function HomeGrids() {
  const { loading, grids } = useHomeGrids()

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {grids.bestsellers.length > 0 && (
        <section>
          <Reveal>
            <div className="relative mb-8 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-700 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <h2 className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg sm:text-xl tracking-wide font-semibold uppercase bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-100 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/70 before:to-white/30 dark:before:from-gray-800/60 dark:before:to-gray-800/20 before:-z-10 before:[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,.6),transparent)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Best Sellers
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:.3s]" />
              </h2>
            </div>
          </Reveal>
          <ProductGrid products={grids.bestsellers} />
        </section>
      )}

      {grids.new.length > 0 && (
        <section>
          <Reveal delay={0.05}>
            <div className="relative mb-8 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-700 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <h2 className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg sm:text-xl tracking-wide font-semibold uppercase bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-100 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/70 before:to-white/30 dark:before:from-gray-800/60 dark:before:to-gray-800/20 before:-z-10 before:[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,.6),transparent)]">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                New Arrivals
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse [animation-delay:.3s]" />
              </h2>
            </div>
          </Reveal>
          <ProductGrid products={grids.new} />
        </section>
      )}

      {grids.budget.length > 0 && (
        <section>
          <Reveal delay={0.1}>
            <div className="relative mb-8 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-700 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <h2 className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg sm:text-xl tracking-wide font-semibold uppercase bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-100 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/70 before:to-white/30 dark:before:from-gray-800/60 dark:before:to-gray-800/20 before:-z-10 before:[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,.6),transparent)]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Budget Items
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse [animation-delay:.3s]" />
              </h2>
            </div>
          </Reveal>
          <ProductGrid products={grids.budget} />
        </section>
      )}
      
      {grids.premium.length > 0 && (
        <section>
          <Reveal delay={0.15}>
            <div className="relative mb-8 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-700 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <h2 className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg sm:text-xl tracking-wide font-semibold uppercase bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-100 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/70 before:to-white/30 dark:before:from-gray-800/60 dark:before:to-gray-800/20 before:-z-10 before:[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,.6),transparent)]">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                Premium Selection
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse [animation-delay:.3s]" />
              </h2>
            </div>
          </Reveal>
          <ProductGrid products={grids.premium} />
        </section>
      )}

      {grids.all.length > 0 && (
        <section>
          <Reveal delay={0.2}>
            <div className="relative mb-8 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300/70 dark:via-gray-700 to-transparent w-full absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <h2 className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg sm:text-xl tracking-wide font-semibold uppercase bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-100 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/70 before:to-white/30 dark:before:from-gray-800/60 dark:before:to-gray-800/20 before:-z-10 before:[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,.6),transparent)]">
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
                All Products
                <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:.3s]" />
              </h2>
            </div>
          </Reveal>
          {/* Show first 2 rows (assuming 4 items per row) */}
          <ProductGrid products={grids.all.slice(0, 8)} />
          {grids.all.length > 8 && (
            <div className="text-center mt-6">
              <Link href="/products" className="btn btn-primary">
                See More
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
