"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'
import { useAuth } from './auth'

export type ProductReview = {
  id: number
  product_id: string
  user_id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
}

export function useProductReviews(productId: string | undefined) {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!productId || !supabase || !isSupabaseConfigured()) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (!error && Array.isArray(data)) setReviews(data as any)
    } finally {
      setLoading(false)
    }
  }, [productId, supabase])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (rating: number, title: string, body: string) => {
    if (!supabase || !isSupabaseConfigured()) throw new Error('SUPABASE_DISABLED')
    if (!user) throw new Error('LOGIN_REQUIRED')
    if (!productId) throw new Error('MISSING_PRODUCT')
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      title: title || null,
      body: body || null,
    })
    if (error) throw error
    await load()
  }, [supabase, user, productId, load])

  const stats = useMemo(() => {
    const count = reviews.length
    const avg = count ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / count : 0
    return { count, avg }
  }, [reviews])

  return { reviews, loading, add, stats, reload: load }
}

// Lightweight aggregate hook for average rating and count with realtime updates
export function useProductRating(productId: string | undefined) {
  const supabase = getSupabaseClient()
  const [avg, setAvg] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!productId || !supabase || !isSupabaseConfigured()) return
    setLoading(true)
    try {
      const { data, count } = await supabase
        .from('product_reviews')
        .select('rating', { count: 'exact' })
        .eq('product_id', productId)
      const ratings = (data as any[] | null) || []
      const sum = ratings.reduce((s, r: any) => s + (Number(r?.rating) || 0), 0)
      const c = count || ratings.length
      setAvg(c ? sum / c : 0)
      setCount(c)
    } finally {
      setLoading(false)
    }
  }, [productId, supabase])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!productId || !supabase || !isSupabaseConfigured()) return
    const channel = supabase
      .channel(`reviews_${productId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_reviews',
        filter: `product_id=eq.${productId}`,
      }, () => { load() })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch {} }
  }, [productId, supabase, load])

  return { avg, count, loading, reload: load }
}
