import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import MotionProvider from '@/components/MotionProvider'
import PageTransition from '@/components/PageTransition'
import ScrollRestoration from '@/components/ScrollRestoration'
import CartDrawer from '@/components/CartDrawer'

const inter = Inter({ subsets: ['latin'] })

// TODO: Set production domain below before deploying (kept placeholder to avoid accidental SEO indexing under wrong host)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trendology.example'),
  title: {
    default: 'Trendology – A marketplace for everything',
    template: '%s · Trendology',
  },
  description: 'Trendology: a modern marketplace for everything you love. Fast checkout, curated products, smooth experience.',
  applicationName: 'Trendology',
  keywords: ['trendology', 'ecommerce', 'marketplace', 'storefront', 'shop', 'next.js'],
  icons: {
    icon: [
      { url: '/brand-icon.png', type: 'image/png', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/brand-icon.png'
  },
  openGraph: {
    title: 'Trendology – A marketplace for everything',
    description: 'Shop across categories with fast checkout and a clean, modern experience at Trendology.',
    url: '/',
    siteName: 'Trendology',
    // Provide PNG fallback (some scrapers ignore SVG). Keep existing SVG for modern clients.
    images: [
      { url: '/brand-og.png', width: 1200, height: 630, alt: 'Trendology' },
      { url: '/og.svg', width: 1200, height: 630, alt: 'Trendology (SVG)' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trendology – A marketplace for everything',
    description: 'Shop across categories with fast checkout and a clean, modern experience at Trendology.',
  images: ['/brand-og.png'],
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
    {/* Canonical link for SEO; Next injects head automatically */}
    <link rel="canonical" href={(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trendology.example') + '/'} />
        <Providers>
          <Suspense fallback={<div className="h-16 sm:h-20" />}> 
            <Header />
          </Suspense>
          <Suspense fallback={<main className="flex-1 mx-auto w-full max-w-[1600px] px-2 sm:px-3 md:px-4 py-6 sm:py-8">Loading…</main>}>
            <MotionProvider>
              <ScrollRestoration />
              <PageTransition>{children}</PageTransition>
            </MotionProvider>
          </Suspense>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
