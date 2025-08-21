"use client"
import AdvertiseBanner, { type Slide } from '@/components/AdvertiseBanner'

const slides: Slide[] = [
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Carefully curated products with a clean, distraction-free shopping experience.',
    cta: { label: 'Shop now', href: '#products' },
    gradientFrom: 'from-fuchsia-600',
    gradientTo: 'to-pink-600',
    bgColor: 'bg-fuchsia-700',
  },
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Experience modern shopping with secure payments and fast delivery.',
    cta: { label: 'Browse categories', href: '#categories' },
    gradientFrom: 'from-sky-600',
    gradientTo: 'to-indigo-600',
    bgColor: 'bg-indigo-700',
  },
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Beautiful UI, smooth checkout, and curated collections.',
    cta: { label: 'Discover products', href: '#products' },
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-600',
    bgColor: 'bg-teal-700',
  },
]

export default function HomeMainSlider() {
  return <AdvertiseBanner slides={slides} size="lg" align="left" />
}
