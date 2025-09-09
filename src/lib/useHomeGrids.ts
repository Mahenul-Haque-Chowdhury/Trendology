"use client";
import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { Product } from './products'
import { products as seed } from './products'

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
    // If Supabase not configured, fall back to local seed data immediately
    if (!supabase) {
      if (seed.length) {
        setGrids({
          bestsellers: seed.slice(0, 4),
          new: seed.slice(0, 4),
          budget: seed.filter(p => p.price < 3000),
          premium: seed.filter(p => p.price >= 3000),
          all: seed,
        })
      }
      setLoading(false)
      return
    }

    const client = supabase

    let ignore = false
    async function fetchGridsData() {
      setLoading(true)
      try {
  // Fetch all products (both active/inactive) so out-of-stock still display
  const { data: products, error: pError } = await client.from('inventory').select('*')

        if (pError) {
          console.error("Error fetching products:", pError)
        }
        
  const { data: gridLinks, error: gError } = await client.from('home_grids').select('product_id, grid')

        if (gError) {
          console.error("Error fetching grid assignments:", gError)
        }

        if (!ignore) {
          const source = (products && products.length > 0) ? products : seed
          const productMap = new Map(source.map((p: any) => [p.id, p]))
          const newGrids: HomeGridsData = {
            bestsellers: [],
            new: [],
            budget: [],
            premium: [],
            all: source as any,
          }

          if (gridLinks && products && products.length > 0) {
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
          // Heuristic fill if using seed (no grid links available)
          if (source === seed) {
            if (newGrids.bestsellers.length === 0) newGrids.bestsellers = seed.slice(0, 4)
            if (newGrids.new.length === 0) newGrids.new = seed.slice(0, 4)
            if (newGrids.budget.length === 0) newGrids.budget = seed.filter(p => p.price < 3000)
            if (newGrids.premium.length === 0) newGrids.premium = seed.filter(p => p.price >= 3000)
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