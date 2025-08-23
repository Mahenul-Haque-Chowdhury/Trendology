// src/components/HomeMainSlider.tsx

"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  theme: 'fuchsia' | 'sky' | 'emerald'; // Themes for this banner
}

// Data for this banner instance
const mainSlides: ThemedSlide[] = [
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Carefully curated products with a clean, distraction-free shopping experience.',
    cta: { label: 'Shop now', href: '#products' },
    theme: 'fuchsia',
  },
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Experience modern shopping with secure payments and fast delivery.',
    cta: { label: 'Browse categories', href: '#categories' },
    theme: 'sky',
  },
  {
    title: 'Minimal store. Maximum comfort.',
    subtitle: 'Beautiful UI, smooth checkout, and curated collections.',
    cta: { label: 'Discover products', href: '#products' },
    theme: 'emerald',
  },
];

// All slides use a plain white background and neutral text/button styling

// The core UI logic
function AdvertiseBanner({ slides, size, align }: { slides: ThemedSlide[]; size: 'lg' | 'sm'; align: 'left' | 'center' }) {
  const sizeClasses = {
    lg: {
      container: 'min-h-[220px] sm:min-h-[280px] md:min-h-[320px] p-6 sm:p-8 md:p-12 bg-white',
      title: 'text-2xl sm:text-3xl md:text-4xl text-gray-900',
      subtitle: 'text-sm sm:text-base text-gray-700',
      cta: 'px-6 py-3 text-md bg-blue-600 text-white hover:bg-blue-700',
    },
    sm: {
      container: 'min-h-[140px] sm:min-h-[180px] p-6 bg-white',
      title: 'text-lg sm:text-xl md:text-2xl text-gray-900',
      subtitle: 'text-sm text-gray-700',
      cta: 'px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700',
    },
  };

  return (
    <motion.div
      className="relative w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden will-change-transform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        breakpoints={{ 640: { spaceBetween: 30 } }}
        className="w-full home-main-slider"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className={`flex items-center w-full h-full ${sizeClasses[size].container} ${align === 'left' ? 'text-left' : 'text-center'}`}
            >
              <div className="max-w-md space-y-4">
                <h2 className={`font-bold tracking-tight ${sizeClasses[size].title}`}>{slide.title}</h2>
                <p className={`${sizeClasses[size].subtitle}`}>{slide.subtitle}</p>
                <Link
                  href={slide.cta.href}
                  className={`inline-block font-semibold rounded-lg transition-transform duration-300 ease-out hover:scale-105 ${sizeClasses[size].cta}`}
                >
                  {slide.cta.label}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Swiper navigation button size override */}
      <style jsx global>{`
        .home-main-slider .swiper-button-next,
        .home-main-slider .swiper-button-prev {
          width: 32px;
          height: 32px;
          min-width: 32px;
            min-height: 32px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.88);
            color: #222;
            box-shadow: 0 1px 4px 0 rgba(0,0,0,0.08);
            font-size: 16px;
            top: 50%;
            transform: translateY(-50%);
        }
        .home-main-slider .swiper-button-prev { left: 0.75rem; }
        .home-main-slider .swiper-button-next { right: 0.75rem; }
        @media (min-width:640px) {
          .home-main-slider .swiper-button-prev { left: 1.25rem; }
          .home-main-slider .swiper-button-next { right: 1.25rem; }
        }
        .home-main-slider .swiper-button-next:after,
        .home-main-slider .swiper-button-prev:after {
          font-size: 16px !important;
        }
  /* Cross-fade style */
  .home-main-slider .swiper-slide { opacity:0; transition:opacity .6s var(--ease-soft, cubic-bezier(.4,0,.2,1)); }
  .home-main-slider .swiper-slide-active { opacity:1; }
  /* Prevent stray horizontal scroll on mobile */
  .home-main-slider { overscroll-behavior-x: contain; }
      `}</style>
  </motion.div>
  );
}


// Final exported component
export default function HomeMainSlider() {
  return <AdvertiseBanner slides={mainSlides} size="lg" align="left" />;
}