"use client";

import HomeMainSlider from '@/components/HomeMainSlider';
import AdvertiseBannerDeals from '@/components/AdvertiseBannerDeals';
import AdvertiseBannerSeason from '@/components/AdvertiseBannerSeason';
import { Banknote } from 'lucide-react';
import Image from 'next/image';
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
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-3 sm:gap-4 opacity-95 will-change-transform"
          aria-label="Accepted payment methods"
        >
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-600 uppercase">We accept</span>
          {[
            { src: '/logos/bkash.webp', alt: 'bKash' },
            { src: '/logos/nagad.webp', alt: 'Nagad' },
            { src: '/logos/rocket.png', alt: 'Rocket' },
            { src: '/logos/upay.webp', alt: 'Upay' },
          ].map(pay => (
            <span key={pay.alt} className="relative h-8 w-14 flex items-center justify-center rounded-md bg-white/90 dark:bg-gray-900/80 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden shadow-sm">
              <Image src={pay.src} alt={pay.alt} fill sizes="56px" className="object-contain p-1" />
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-full px-2.5 py-1 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
            <Banknote className="h-4 w-4 text-emerald-600" />
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
