"use client"
import AdvertiseBannerDeals from '@/components/AdvertiseBannerDeals'
import AdvertiseBannerSeason from '@/components/AdvertiseBannerSeason'
import HomeMainSlider from '@/components/HomeMainSlider'
import { Banknote } from 'lucide-react'

export default function HomeHero() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {/* Left: Minimal hero card */}
      <div className="md:col-span-2 space-y-4">
        <HomeMainSlider />
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/bkash.webp" alt="bKash" className="h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/nagad.webp" alt="Nagad" className="h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/rocket.png" alt="Rocket" className="h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/upay.webp" alt="Upay" className="h-6 w-auto" />
          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 bg-white/80 backdrop-blur rounded-full px-3 py-1 ring-1 ring-gray-200">
            <Banknote className="h-4 w-4 text-emerald-600" />
            Cash on delivery
          </span>
        </div>
      </div>

      {/* Right: two stacked promo sliders */}
      <div className="grid gap-4">
        <AdvertiseBannerDeals size="sm" />
        <AdvertiseBannerSeason size="sm" />
      </div>
    </section>
  )
}
