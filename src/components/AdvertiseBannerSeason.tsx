// src/components/AdvertiseBannerSeason.tsx

"use client";

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Type definition for a themed slide
interface ThemedSlide {
  title: string;
  subtitle: string;
  cta: { 
    label: string;
    href: string; 
  };
  theme: 'sky' | 'teal'; // Themes for this banner
}

// Data for this banner instance
const seasonSlides: ThemedSlide[] = [
  {
    title: 'Seasonal Collections',
    subtitle: 'Fresh picks curated for the season.',
    cta: { label: 'Browse collection', href: '/category/fashion' },
    theme: 'sky',
  },
  {
    title: 'Essentials Restocked',
    subtitle: 'Back-in-stock favorites you love.',
    cta: { label: 'View essentials', href: '/category/essentials' },
    theme: 'teal',
  },
];

// Centralized style mapping for themes
const themeStyles = {
  sky: {
    gradient: 'from-sky-600 to-sky-700',
    cta: 'bg-white text-sky-700 hover:bg-sky-50',
  },
  teal: {
    gradient: 'from-teal-600 to-teal-700',
    cta: 'bg-white text-teal-700 hover:bg-teal-50',
  },
};

// The core UI logic
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
        className="season-slider"
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
        .season-slider .swiper-button-next,
        .season-slider .swiper-button-prev {
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
        .season-slider .swiper-button-next:after,
        .season-slider .swiper-button-prev:after {
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
}


// Final exported component
export default function AdvertiseBannerSeason({ size = 'sm' }: { size?: 'lg' | 'sm' }) {
  return <AdvertiseBanner slides={seasonSlides} size={size} />;
}