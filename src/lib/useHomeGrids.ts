"use client";
import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { Product } from './products'

export type HomeGridsData = {
  bestsellers: Product[]
  new: Product[]
  budget: Product[]
  premium: Product[]
  all: Product[]
}

export function useHomeGrids() {
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [grids, setGrids] = useState<HomeGridsData>({
    bestsellers: [],
    new: [],
    budget: [],
    premium: [],
    all: [],
  })

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const client = supabase

    let ignore = false
    async function fetchGridsData() {
      setLoading(true)
      try {
        const { data: products, error: pError } = await client.from('inventory').select('*').eq('active', true)

        if (pError) {
          console.error("Error fetching products:", pError)
        }
        
  const { data: gridLinks, error: gError } = await client.from('home_grids').select('product_id, grid')

        if (gError) {
          console.error("Error fetching grid assignments:", gError)
        }

        if (!ignore && products) {
          const productMap = new Map(products.map(p => [p.id, p]))
          const newGrids: HomeGridsData = {
            bestsellers: [],
            new: [],
            budget: [],
            premium: [],
            all: products,
          }

          if (gridLinks) {
            for (const link of gridLinks) {
              const product = productMap.get(link.product_id)
              if (product) {
                switch (link.grid) {
                  case 'bestsellers':
                    newGrids.bestsellers.push(product)
                    break
                  case 'new':
                    newGrids.new.push(product)
                    break
                  case 'budget':
                    newGrids.budget.push(product)
                    break
                  case 'premium':
                    newGrids.premium.push(product)
                    break
                }
              }
            }
          }
          setGrids(newGrids)
        }
      } catch (err) {
        console.error("Error in fetchGridsData:", err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchGridsData()
    return () => { ignore = true }
  }, [supabase])

  return { loading, grids }
}