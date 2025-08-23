"use client";

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

type Tone = 'rose' | 'amber' | 'sky';
interface Slide { title: string; subtitle: string; cta: { label: string; href: string }; tone: Tone; }

const slides: Slide[] = [
  { title: 'Mega Deals Week', subtitle: 'Limited-time offers across electronics and gadgets.', cta: { label: 'Shop deals', href: '/category/gadgets' }, tone: 'rose' },
  { title: 'Home & Living Savings', subtitle: 'Upgrade your space with budget essentials.', cta: { label: 'Explore home', href: '/category/home' }, tone: 'amber' },
  { title: 'Fresh Fashion Finds', subtitle: 'Discover the latest trends for the season.', cta: { label: 'View collection', href: '/category/fashion' }, tone: 'sky' },
];

const toneUi: Record<Tone, { bg: string; cta: string }> = {
  rose: { bg: 'bg-rose-600', cta: 'bg-white text-rose-700 hover:bg-rose-50' },
  amber: { bg: 'bg-amber-500', cta: 'bg-white text-amber-700 hover:bg-amber-50' },
  sky: { bg: 'bg-sky-500', cta: 'bg-white text-sky-700 hover:bg-sky-50' },
};

export default function AdvertiseBannerDeals() {
  return (
  <div className="relative rounded-2xl overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="deals-swiper"
      >
        {slides.map((s, i) => {
          const t = toneUi[s.tone];
          return (
            <SwiperSlide key={i}>
              <div className={`flex flex-col justify-center gap-4 min-h-[180px] px-7 py-6 text-white ${t.bg}`}>
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
        /* Force containment */
        .deals-swiper,
        .deals-swiper .swiper,
        .deals-swiper .swiper-wrapper,
        .deals-swiper .swiper-slide {max-width:100% !important; width:100% !important; box-sizing:border-box;}
        .deals-swiper .swiper-slide {flex:0 0 100% !important;}
  .deals-swiper .swiper-slide > div {display:flex; flex-direction:column; height:100%;}
  .deals-swiper .swiper-pagination {position:absolute; bottom:18px; left:0; width:100%; display:flex; justify-content:center; gap:10px;}
  .deals-swiper .swiper-pagination-bullet { background:rgba(255,255,255,.55); opacity:1; width:10px; height:10px; }
  .deals-swiper .swiper-pagination-bullet-active { background:#fff; }
        body {overflow-x:hidden;}
      `}</style>
    </div>
  );
}
