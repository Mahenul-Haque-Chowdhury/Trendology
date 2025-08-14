"use client"
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Slide = {
  title: string
  subtitle?: string
  cta?: { label: string; href: string }
  gradientFrom?: string
  gradientTo?: string
}

const slides: Slide[] = [
  {
    title: 'A marketplace for everything',
    subtitle: 'Shop curated products across categories with fast checkout and friendly UI.',
    cta: { label: 'Browse featured', href: '#products' },
  },
  {
    title: 'Free delivery on orders 50+',
    subtitle: 'Enjoy fast, free delivery on eligible items—no coupon needed.',
    cta: { label: 'See deals', href: '/category/decor' },
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-emerald-700',
  },
  {
    title: 'Work smarter at your desk',
    subtitle: 'Ergonomic furniture and accessories for your workspace.',
    cta: { label: 'Shop office', href: '/category/office' },
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-indigo-700',
  },
]

export default function AdvertiseBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (paused) return
    timer.current && clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4500)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused])

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length)

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      {/* Floating container */}
      <div
        className="relative overflow-hidden rounded-2xl bg-transparent text-white shadow-2xl ring-1 ring-black/5 translate-y-0 md:-translate-y-1 will-change-transform min-h-[260px] sm:min-h-[320px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slide stack */}
        <div className="relative h-full">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'} bg-gradient-to-br ${(s.gradientFrom ?? 'from-brand')} ${(s.gradientTo ?? 'to-brand-dark')} bg-cover bg-no-repeat`}
              aria-hidden={i !== index}
            >
              {/* Decorative blob */}
              <div className="absolute inset-0 opacity-20" aria-hidden>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="#fff" d="M35.7,-52.6C47.8,-44.1,59.6,-35,64.3,-23.5C69,-12.1,66.6,1.8,60.6,14.5C54.6,27.1,45.1,38.5,33.7,46.7C22.3,54.8,9.1,59.7,-3.2,64C-15.5,68.2,-31.1,71.8,-44.1,66.8C-57.1,61.8,-67.5,48.2,-72.7,33.1C-77.9,18,-77.9,1.4,-72.9,-13.2C-67.8,-27.8,-57.6,-40.3,-45.6,-49.2C-33.6,-58,-19.8,-63.3,-6,-60.9C7.9,-58.5,15.7,-48.4,35.7,-52.6Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="relative px-4 sm:px-10 py-10 sm:py-16 md:py-24 pb-16 sm:pb-24 md:pb-32 text-center">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3">{s.title}</h2>
                {s.subtitle && (
                  <p className="opacity-90 max-w-2xl mx-auto text-sm sm:text-base">{s.subtitle}</p>
                )}
                {s.cta && (
                  <div className="mt-6 flex justify-center">
                    <Link href={s.cta.href} className="btn btn-accent w-full sm:w-auto">
                      {s.cta.label}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Maintain height for absolute slides */}
          <div className="invisible px-4 sm:px-10 py-10 sm:py-16 md:py-24 pb-16 sm:pb-24 md:pb-32">
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold">.</span>
          </div>
    </div>

  {/* Bottom gradient to blend with page background */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-white/80"></div>

  {/* Controls */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-5 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`pointer-events-auto h-2.5 w-2.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button aria-label="Previous" className="m-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => go(-1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M12.7 15.3a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L8.41 9l4.3 4.3a1 1 0 0 1 0 1.4z"/></svg>
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button aria-label="Next" className="m-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => go(1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.3 4.7a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.59 11 7.3 6.7a1 1 0 0 1 0-1.4z"/></svg>
          </button>
        </div>
      </div>
    </section>
  )
}
