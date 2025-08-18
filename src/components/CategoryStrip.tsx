"use client"
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES } from '@/lib/categories'

export default function CategoryStrip() {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-6 px-1 py-2">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="flex flex-col items-center gap-2 shrink-0 group" aria-label={`Browse ${c.label}`}>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-1 ring-gray-200 group-hover:ring-brand transition">
              {c.image ? (
                <Image src={c.image} alt={c.label} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="text-sm sm:text-base font-medium text-gray-900">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
