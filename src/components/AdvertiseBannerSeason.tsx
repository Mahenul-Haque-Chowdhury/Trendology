"use client"
import AdvertiseBanner, { type Slide } from '@/components/AdvertiseBanner'

const slides: Slide[] = [
  {
    title: 'Seasonal Collections',
    subtitle: 'Fresh picks curated for the season.',
    cta: { label: 'Browse collection', href: '/category/fashion' },
    gradientFrom: 'from-sky-600',
    gradientTo: 'to-sky-700',
    bgColor: 'bg-sky-700',
  },
  {
    title: 'Essentials Restocked',
    subtitle: 'Back-in-stock favorites you love.',
    cta: { label: 'View essentials', href: '/category/essentials' },
    gradientFrom: 'from-teal-600',
    gradientTo: 'to-teal-700',
    bgColor: 'bg-teal-700',
  },
]

export default function AdvertiseBannerSeason({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return <AdvertiseBanner slides={slides} size={size} />
}
