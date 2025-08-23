"use client";

import HomeMainSlider from '@/components/HomeMainSlider';
import AdvertiseBannerDeals from '@/components/AdvertiseBannerDeals';
import AdvertiseBannerSeason from '@/components/AdvertiseBannerSeason';
import { Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParallax } from '@/lib/useParallax';

// Reworked HomeHero: simpler layout, no negative margins, mobile-first sizing.
export default function HomeHero() {
  const { ref, style } = useParallax(0.25)
  return (
	<section className="grid gap-4 md:grid-cols-3 overflow-hidden max-w-full">
      {/* Main slider + payment strip */}
	<div className="md:col-span-2 space-y-4 min-w-0">
        <div>
          <HomeMainSlider />
        </div>
        <motion.div
          ref={ref as any}
          style={style as any}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-4 sm:gap-6 opacity-90 will-change-transform"
        >
          <span className="text-sm sm:text-base font-semibold text-gray-700 mr-1">We accept-</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/bkash.webp" alt="bKash" className="h-7 sm:h-8 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/nagad.webp" alt="Nagad" className="h-7 sm:h-8 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/rocket.png" alt="Rocket" className="h-7 sm:h-8 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/upay.webp" alt="Upay" className="h-7 sm:h-8 w-auto" />
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-800 bg-white/80 backdrop-blur rounded-full px-3 py-1 ring-1 ring-gray-200">
            <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            Cash on delivery
          </span>
        </motion.div>
      </div>

      {/* Side stacked compact banners */}
  <div className="grid gap-4 min-w-0 px-0">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.18 }}
        >
          <AdvertiseBannerDeals />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.28 }}
        >
          <AdvertiseBannerSeason />
        </motion.div>
      </div>
    </section>
  );
}
