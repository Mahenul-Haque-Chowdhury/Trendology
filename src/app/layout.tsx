import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import CartDrawer from '@/components/CartDrawer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aamardokan.example'),
  title: {
    default: 'AamarDokan — Online Marketplace for Everything',
    template: '%s · AamarDokan',
  },
  description: 'Discover quality products across categories. Fast checkout and a clean shopping experience.',
  applicationName: 'AamarDokan',
  keywords: ['ecommerce', 'storefront', 'shop', 'next.js', 'aamardokan'],
  icons: { icon: '/og.svg' },
  openGraph: {
    title: 'AamarDokan — Online Marketplace for Everything',
    description: 'Discover quality products across categories. Fast checkout and a clean shopping experience.',
    url: '/',
    siteName: 'AamarDokan',
    images: [
      { url: '/og.svg', width: 1200, height: 630, alt: 'AamarDokan' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AamarDokan — Online Marketplace for Everything',
    description: 'Discover quality products across categories. Fast checkout and a clean shopping experience.',
  images: ['/og.svg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#1E6BD6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-gray-900`}>
        <Providers>
          <Suspense fallback={<div className="h-16 sm:h-20" />}> 
            <Header />
          </Suspense>
          <Suspense fallback={<main className="flex-1 mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 py-6 sm:py-8">Loading…</main>}>
            <main className="flex-1 mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 py-6 sm:py-8">{children}</main>
          </Suspense>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
