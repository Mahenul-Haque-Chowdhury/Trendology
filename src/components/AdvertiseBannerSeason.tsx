"use client";

// Fresh rework: Compact Season Banner
// Similar sizing to deals banner; two-tone themes.

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

type Tone = 'sky' | 'teal';
interface Slide { title: string; subtitle: string; cta: { label: string; href: string }; tone: Tone; }

const slides: Slide[] = [
  { title: 'Seasonal Collections', subtitle: 'Fresh picks curated for the season.', cta: { label: 'Browse collection', href: '/category/fashion' }, tone: 'sky' },
  { title: 'Essentials Restocked', subtitle: 'Back-in-stock favorites you love.', cta: { label: 'View essentials', href: '/category/essentials' }, tone: 'teal' },
];

const toneUi: Record<Tone, { bg: string; cta: string }> = {
  sky: { bg: 'bg-sky-600', cta: 'bg-white text-sky-700 hover:bg-sky-50' },
  teal: { bg: 'bg-teal-600', cta: 'bg-white text-teal-700 hover:bg-teal-50' },
};

export default function AdvertiseBannerSeason() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(t)
  }, [])
  return (
	<motion.div
      className="relative rounded-2xl overflow-hidden will-change-transform"
      initial={{ opacity: 0, y: 24, scale: 0.965 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="season-swiper"
      >
        {slides.map((s, i) => {
          const t = toneUi[s.tone];
          return (
            <SwiperSlide key={i}>
              <div className={`flex flex-col justify-center gap-4 min-h-[180px] px-6 sm:px-7 py-6 text-white ${t.bg}`}>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-semibold tracking-tight leading-snug">{s.title}</h3>
                  <p className="text-sm leading-snug opacity-95">{s.subtitle}</p>
                </div>
                <Link href={s.cta.href} className={`w-fit rounded-md px-4 py-2 text-sm font-medium transition-colors bg-white text-gray-800 hover:bg-white/90`}>{s.cta.label}</Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <style jsx global>{`
        .season-swiper,
        .season-swiper .swiper,
        .season-swiper .swiper-wrapper,
        .season-swiper .swiper-slide {max-width:100% !important; width:100% !important; box-sizing:border-box;}
        .season-swiper .swiper-slide {flex:0 0 100% !important;}
  .season-swiper .swiper-slide > div {display:flex; flex-direction:column; height:100%;}
  .season-swiper .swiper-pagination {position:absolute; bottom:18px; left:0; width:100%; display:flex; justify-content:center; gap:10px;}
  .season-swiper .swiper-pagination-bullet { background:rgba(255,255,255,.55); opacity:1; width:10px; height:10px; }
  .season-swiper .swiper-pagination-bullet-active { background:#fff; }
  .season-swiper .swiper-slide {opacity:0; transition:opacity .65s var(--ease-soft, cubic-bezier(.4,0,.2,1));}
  .season-swiper .swiper-slide-active {opacity:1;}
        body {overflow-x:hidden;}
      `}</style>
  </motion.div>
  );
}
