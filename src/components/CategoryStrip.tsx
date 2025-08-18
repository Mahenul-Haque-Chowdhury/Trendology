"use client"
import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'

function fallbackFor(label: string) {
  return `https://placehold.co/200x200?text=${encodeURIComponent(label)}`
}

export default function CategoryStrip() {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-6 px-1 py-2">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 shrink-0 group" aria-label={`Browse ${c.label}`}>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-1 ring-gray-200 group-hover:ring-brand transition">
              {/* Use plain img with robust onError fallback to avoid Next.js upstream fetch errors */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || fallbackFor(c.label)}
                alt={c.label}
                width={96}
                height={96}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement
                  if (el.src !== fallbackFor(c.label)) el.src = fallbackFor(c.label)
                }}
              />
            </div>
            <div className="text-sm sm:text-base font-medium text-gray-900">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
