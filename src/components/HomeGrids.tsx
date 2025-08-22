"use client";
import { useHomeGrids } from "@/lib/useHomeGrids"
import ProductGrid from "./ProductGrid"
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
          <h2 className="text-2xl font-bold mb-4">Best Sellers</h2>
          <ProductGrid products={grids.bestsellers} />
        </section>
      )}

      {grids.new.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
          <ProductGrid products={grids.new} />
        </section>
      )}

      {grids.budget.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Budget Items</h2>
          <ProductGrid products={grids.budget} />
        </section>
      )}
      
      {grids.premium.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Premium Selection</h2>
          <ProductGrid products={grids.premium} />
        </section>
      )}

      {grids.all.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">All Products</h2>
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
