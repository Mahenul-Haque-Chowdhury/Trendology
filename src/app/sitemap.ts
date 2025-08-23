import type { MetadataRoute } from 'next'
import { products } from '@/lib/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = new URL('https://www.trendology.example')
  const now = new Date()
  const items: MetadataRoute.Sitemap = [
    { url: new URL('/', base).toString(), lastModified: now, changeFrequency: 'daily', priority: 1 },
  { url: new URL('/privacy-policy', base).toString(), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  { url: new URL('/terms', base).toString(), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...Array.from(new Set(products.map((p) => p.category))).map((slug) => ({
      url: new URL(`/category/${slug}`, base).toString(),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: new URL(`/products/${p.id}`, base).toString(),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
  return items
}
