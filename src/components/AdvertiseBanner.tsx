"use client"
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

// 1. IMPROVED TYPE DEFINITION
// Color classes are now part of the data, making it self-contained and easier to manage.
export type Slide = {
  title: string
  subtitle?: string
  cta?: { label: string; href: string }
  gradientFrom: string
  gradientTo: string
  bgColor: string // The solid background color for overlays and fallbacks
}

// 2. DATA IS SELF-CONTAINED
// For easy copy-pasting, the data is included here. In a larger app, you'd pass this as a prop.
const defaultSlides: Slide[] = [
  {
    title: 'A marketplace for everything',
    subtitle: 'Shop curated products across categories with fast checkout and friendly UI.',
    cta: { label: 'Browse featured', href: '#products' },
    gradientFrom: 'from-gray-800',
    gradientTo: 'to-gray-900',
    bgColor: 'bg-gray-900',
  },
  {
    title: 'Free delivery on orders 50+',
    subtitle: 'Enjoy fast, free delivery on eligible items—no coupon needed.',
    cta: { label: 'See deals', href: '/category/decor' },
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-emerald-700',
    bgColor: 'bg-emerald-700',
  },
  {
    title: 'Work smarter at your desk',
    subtitle: 'Ergonomic furniture and accessories for your workspace.',
    cta: { label: 'Shop office', href: '/category/office' },
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-indigo-700',
    bgColor: 'bg-indigo-700',
  },
]

export default function AdvertiseBanner({
  slides = defaultSlides,
  size = 'lg',
  align = 'center',
  variant = 'solid',
  autoPlay = false,
  showIndicators = false,
}: {
  slides?: Slide[]
  size?: 'lg' | 'sm'
  align?: 'left' | 'center'
  variant?: 'solid' | 'gradient'
  autoPlay?: boolean
  showIndicators?: boolean
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const interval = 4500 // Autoplay interval in milliseconds

  // 3. OPTIMIZED TIMER FOR TRUE PAUSE & RESUME
  // Provides a better user experience than resetting the timer on every hover.
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const remainingTimeRef = useRef(interval)
  const startTimeRef = useRef(0)

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      const elapsedTime = Date.now() - startTimeRef.current
      remainingTimeRef.current -= elapsedTime
    }
  }, [])

  const resumeTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setTimeout(() => {
      remainingTimeRef.current = interval // Reset for the next slide
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, remainingTimeRef.current)
  }, [interval])

  // Effect for handling the autoplay logic
  useEffect(() => {
    // 4. ACCESSIBILITY: Respect user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (autoPlay && !prefersReducedMotion) {
      resumeTimer()
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      timerRef.current && clearInterval(timerRef.current)
    }
  }, [currentIndex, resumeTimer, autoPlay])
  
  // Handlers for manual navigation
  const goToSlide = useCallback((index: number) => {
    pauseTimer()
    remainingTimeRef.current = interval // Reset timer for the new slide
    setCurrentIndex(index)
  }, [pauseTimer, interval])

  const navigate = useCallback((direction: 1 | -1) => {
    const nextIndex = (currentIndex + direction + slides.length) % slides.length
    goToSlide(nextIndex)
  }, [currentIndex, goToSlide])

  const activeSlide = slides[currentIndex]

  const sizeClasses = size === 'lg'
    ? {
        minH: 'min-h-[220px] sm:min-h-[280px] md:min-h-[320px]',
        pad: 'px-5 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16',
        heading: 'text-2xl sm:text-3xl md:text-4xl',
      }
    : {
        minH: 'min-h-[140px] sm:min-h-[180px]',
        pad: 'px-4 sm:px-6 py-6 sm:py-8',
        heading: 'text-lg sm:text-xl md:text-2xl',
      }

  return (
    <section className="relative" aria-roledescription="carousel" aria-label="Promotions">
      <div
        className={`relative overflow-hidden ${activeSlide.bgColor} text-white will-change-transform ${sizeClasses.minH} rounded-2xl`}
        onMouseEnter={pauseTimer}
        onMouseLeave={resumeTimer}
        onFocus={pauseTimer}
        onBlur={resumeTimer}
      >
        {/* 5. ACCESSIBILITY: Live Region announces slide changes to screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {`Slide ${currentIndex + 1} of ${slides.length}: ${activeSlide.title}`}
        </div>
        
        <div className="relative h-full">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 motion-safe:transition-opacity duration-700 ${i === currentIndex ? 'opacity-100' : 'opacity-0'} ${variant === 'gradient' ? `bg-gradient-to-br ${slide.gradientFrom} ${slide.gradientTo}` : slide.bgColor} bg-cover bg-no-repeat`}
              aria-hidden={i !== currentIndex}
            >
              <div className="absolute inset-0 opacity-20 hidden sm:block" aria-hidden>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="#fff" d="M35.7,-52.6C47.8,-44.1,59.6,-35,64.3,-23.5C69,-12.1,66.6,1.8,60.6,14.5C54.6,27.1,45.1,38.5,33.7,46.7C22.3,54.8,9.1,59.7,-3.2,64C-15.5,68.2,-31.1,71.8,-44.1,66.8C-57.1,61.8,-67.5,48.2,-72.7,33.1C-77.9,18,-77.9,1.4,-72.9,-13.2C-67.8,-27.8,-57.6,-40.3,-45.6,-49.2C-33.6,-58,-19.8,-63.3,-6,-60.9C7.9,-58.5,15.7,-48.4,35.7,-52.6Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className={`relative ${sizeClasses.pad} ${align === 'left' ? 'text-left' : 'text-center'}`}>
                <h2 className={`${sizeClasses.heading} font-extrabold tracking-tight mb-2 sm:mb-3`}>{slide.title}</h2>
                {slide.subtitle && <p className="opacity-90 max-w-2xl mx-auto text-sm sm:text-base">{slide.subtitle}</p>}
                {slide.cta && (
                  <div className={`mt-6 flex ${align === 'left' ? 'justify-start' : 'justify-center'}`}>
                    <Link href={slide.cta.href} className="btn btn-accent w-full sm:w-auto">{slide.cta.label}</Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Invisible element to maintain container height based on content */}
      <div className={`invisible ${sizeClasses.pad}`}>
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold">.</span>
          </div>
        </div>

        {/* Bottom solid strip matching the current slide color */}
  <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 sm:h-10 ${activeSlide.bgColor}`}></div>

        {/* Controls */}
        {showIndicators && slides.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 sm:bottom-4 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`pointer-events-auto h-2.5 w-2.5 rounded-full motion-safe:transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button aria-label="Previous" className="m-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M12.7 15.3a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L8.41 9l4.3 4.3a1 1 0 0 1 0 1.4z"/></svg>
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button aria-label="Next" className="m-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => navigate(1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.3 4.7a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.59 11 7.3 6.7a1 1 0 0 1 0-1.4z"/></svg>
          </button>
        </div>
      </div>
    </section>
  )
}