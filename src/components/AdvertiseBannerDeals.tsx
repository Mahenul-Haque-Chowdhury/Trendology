// src/components/AdvertiseBannerDeals.tsx

"use client";

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles (ensure you've run `npm install swiper`)
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// 1. TYPE DEFINITION (Previously in its own file)
// A more robust and reusable type definition for any themed slide
interface ThemedSlide {
  title: string;
  subtitle: string;
  cta: { 
    label: string;
    href: string; 
  };
  theme: 'rose' | 'amber' | 'sky'; // Abstract theme keys
}

// 2. DATA (Previously in its own file)
// The specific data for this banner instance
const dealsSlides: ThemedSlide[] = [
  {
    title: 'Mega Deals Week',
    subtitle: 'Limited-time offers across electronics and gadgets.',
    cta: { label: 'Shop deals', href: '/category/gadgets' },
    theme: 'rose',
  },
  {
    title: 'Home & Living Savings',
    subtitle: 'Upgrade your space with budget-friendly essentials.',
    cta: { label: 'Explore home', href: '/category/home' },
    theme: 'amber',
  },
  {
    title: 'Fresh Fashion Finds',
    subtitle: 'Discover the latest trends for the new season.',
    cta: { label: 'View collection', href: '/category/fashion' },
    theme: 'sky',
  },
];

// 3. GENERIC BANNER IMPLEMENTATION (Previously the UI component)
// Centralized style mapping. To add a new theme, you only need to add it here.
const themeStyles = {
  rose: {
    gradient: 'from-rose-600 to-rose-700',
    cta: 'bg-white text-rose-700 hover:bg-rose-50',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-600',
    cta: 'bg-white text-amber-700 hover:bg-amber-50',
  },
  sky: {
    gradient: 'from-sky-500 to-sky-600',
    cta: 'bg-white text-sky-700 hover:bg-sky-50',
  },
};

// This is the core UI logic
function AdvertiseBanner({ slides, size }: { slides: ThemedSlide[]; size: 'lg' | 'sm' }) {
  const sizeClasses = {
    lg: {
      container: 'min-h-[280px] md:min-h-[320px] p-8 md:p-12',
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-lg',
      cta: 'px-6 py-3 text-md',
    },
    sm: {
      container: 'min-h-[140px] p-4',
      title: 'text-xl',
      subtitle: 'text-sm',
      cta: 'px-3 py-2 text-xs',
    },
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="deals-slider"
      > 
        {slides.map((slide, index) => {
          const styles = themeStyles[slide.theme];
          return (
            <SwiperSlide key={index}>
              <div
                className={`items-center w-full max-w-full h-full rounded-xl text-white bg-gradient-to-br ${styles.gradient} ${sizeClasses[size].container}`}
              >
                <div className="max-w-md space-y-4">
                  <h2 className={`font-bold tracking-tight ${sizeClasses[size].title}`}>
                    {slide.title}
                  </h2>
                  <p className={`opacity-90 ${sizeClasses[size].subtitle}`}>
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.cta.href}
                    className={`inline-block font-semibold rounded-lg transition-transform duration-300 ease-out hover:scale-105 ${styles.cta} ${sizeClasses[size].cta}`}
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <style jsx global>{`
        .deals-slider .swiper-button-next,
        .deals-slider .swiper-button-prev {
          width: 28px;
          height: 28px;
          min-width: 28px;
          min-height: 28px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.85);
          color: #222;
          box-shadow: 0 1px 4px 0 rgba(0,0,0,0.07);
          font-size: 14px;
        }
        .deals-slider .swiper-button-next:after,
        .deals-slider .swiper-button-prev:after {
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
}


// 4. FINAL EXPORTED COMPONENT (The "Deals" specific banner)
export default function AdvertiseBannerDeals({ size = 'sm' }: { size?: 'lg' | 'sm' }) {
  return <AdvertiseBanner slides={dealsSlides} size={size} />;
}