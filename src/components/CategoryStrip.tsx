"use client"
import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'

function fallbackFor(label: string) {
  return `https://placehold.co/200x200?text=${encodeURIComponent(label)}`
}

export default function CategoryStrip() {
  return (
    <div>
      {/* Mobile: horizontal scroll; md+: responsive grid tiles */}
      <div className="md:hidden overflow-x-auto -mx-2 px-2 py-2">
        <div className="flex items-stretch gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="shrink-0 group rounded-xl border bg-white ring-1 ring-gray-200 hover:ring-brand transition p-3 flex items-center gap-3 min-w-[220px]"
              aria-label={`Browse ${c.label}`}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image || fallbackFor(c.label)}
                  alt={c.label}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement
                    if (el.src !== fallbackFor(c.label)) el.src = fallbackFor(c.label)
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{c.label}</div>
                <div className="text-xs text-gray-500">Shop now →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group rounded-xl border bg-white ring-1 ring-gray-200 hover:ring-brand transition p-3 flex items-center gap-3"
            aria-label={`Browse ${c.label}`}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || fallbackFor(c.label)}
                alt={c.label}
                width={64}
                height={64}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement
                  if (el.src !== fallbackFor(c.label)) el.src = fallbackFor(c.label)
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{c.label}</div>
              <div className="text-xs text-gray-500">Shop now →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
