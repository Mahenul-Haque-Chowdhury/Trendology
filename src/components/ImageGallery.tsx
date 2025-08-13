"use client"
import Image from 'next/image'
import { useState } from 'react'

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const show = images[active] ?? images[0]
  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] card overflow-hidden bg-gray-50">
        <Image src={show} alt={alt} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${i === active ? 'border-brand' : 'border-transparent hover:border-gray-200'}`}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
