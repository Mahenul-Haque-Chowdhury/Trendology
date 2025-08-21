"use client"
import AdvertiseBanner, { type Slide } from '@/components/AdvertiseBanner'

const slides: Slide[] = [
  {
    title: 'Mega Deals Week',
    subtitle: 'Limited-time offers across electronics and gadgets.',
    cta: { label: 'Shop deals', href: '/category/gadgets' },
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-rose-700',
    bgColor: 'bg-rose-700',
  },
  {
    title: 'Home & Living Savings',
    subtitle: 'Upgrade your space with budget-friendly essentials.',
    cta: { label: 'Explore home', href: '/category/home' },
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600',
    bgColor: 'bg-amber-600',
  },
]

export default function AdvertiseBannerDeals({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return <AdvertiseBanner slides={slides} size={size} />
}
