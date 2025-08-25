"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Clock, ArrowRight, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'

// Clean rebuilt footer (fixes malformed previous version)
export default function Footer() {
  const year = new Date().getFullYear()

  const toggle = (btn: HTMLButtonElement) => {
    if (typeof window === 'undefined') return
    if (window.innerWidth >= 640) return
    const parent = btn.closest('[data-collapsible]') as HTMLElement | null
    if (!parent) return
    const open = parent.getAttribute('data-open') === 'true'
    parent.setAttribute('data-open', (!open).toString())
    btn.setAttribute('aria-expanded', (!open).toString())
    const body = parent.querySelector<HTMLElement>('[data-body]')
    if (body) {
      if (open) body.setAttribute('hidden', 'true')
      else body.removeAttribute('hidden')
    }
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 pt-12 pb-8 border-t border-gray-200/60 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3 mb-10">
          <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm dark:bg-gray-900 dark:ring-gray-800">
            <Image src="/brand-icon.png" alt="Trendology logo" width={50} height={50} className="object-contain" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand drop-shadow-sm hover:text-[var(--brand-accent)] transition-colors">Trendology</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">Carefully Chosen Products for customer satisfaction.</p>
          </div>
        </div>

        <div className="grid gap-12 lg:gap-16 md:grid-cols-3">
          <div className="footer-section" data-collapsible data-open="true">
            <button className="w-full flex items-center justify-between sm:block group" aria-expanded="true" aria-controls="footer-support" onClick={(e) => toggle(e.currentTarget)}>
              <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 dark:text-gray-100 mb-5 sm:mb-5">SUPPORT</h3>
              <span className="sm:hidden ml-2 text-gray-500 transition-transform">▾</span>
            </button>
            <div id="footer-support" data-body data-open="true" className="footer-section-body space-y-5" role="region" aria-label="Support">
              <a href="tel:01798651950" className="group flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 px-5 py-4 shadow-sm transition" aria-label="Call support 01798651950">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20">
                  <Phone size={24} />
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock size={12}/> 11 AM – 6 PM</div>
                  <div className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">01798651950</div>
                </div>
                <ArrowRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          <div className="footer-section" data-collapsible data-open="true">
            <button className="w-full flex items-center justify-between sm:block group" aria-expanded="true" aria-controls="footer-about" onClick={(e) => toggle(e.currentTarget)}>
              <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 dark:text-gray-100 mb-5 sm:mb-5">ABOUT US</h3>
              <span className="sm:hidden ml-2 text-gray-500 transition-transform">▾</span>
            </button>
            <div id="footer-about" data-body data-open="true" className="footer-section-body" role="region" aria-label="About links">
              <ul className="space-y-3 text-sm">
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/terms#refund-policy">Refund Policy</Link></li>
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/account/orders">Orders</Link></li>
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/terms">Terms &amp; Conditions</Link></li>
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/account">My Account</Link></li>
                <li><Link className="hover:text-gray-900 dark:hover:text-gray-100 text-gray-600 dark:text-gray-400 transition" href="/account/wishlist">Wishlist</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-section" data-collapsible data-open="true">
            <button className="w-full flex items-center justify-between sm:block group" aria-expanded="true" aria-controls="footer-connect" onClick={(e) => toggle(e.currentTarget)}>
              <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 dark:text-gray-100 mb-5 sm:mb-5">STAY CONNECTED</h3>
              <span className="sm:hidden ml-2 text-gray-500 transition-transform">▾</span>
            </button>
            <div id="footer-connect" data-body data-open="true" className="footer-section-body" role="region" aria-label="Contact">
              <address className="not-italic text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                80/B Gulshan-Badda Link Road, Dhaka 1212<br />
                <a href="mailto:support@trendology.com" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-200">support@trendology.com</a>
              </address>
              <div className="flex items-center gap-5">
                <a href="#" aria-label="Facebook" aria-disabled="true" className="text-gray-400 hover:text-blue-600 transition cursor-not-allowed"><Facebook size={22} /></a>
                <a href="#" aria-label="YouTube" aria-disabled="true" className="text-gray-400 hover:text-red-600 transition cursor-not-allowed"><Youtube size={22} /></a>
                <a href="#" aria-label="Instagram" aria-disabled="true" className="text-gray-400 hover:text-pink-500 transition cursor-not-allowed"><Instagram size={22} /></a>
                <a href="#" aria-label="Message" aria-disabled="true" className="text-gray-400 hover:text-green-600 transition cursor-not-allowed"><MessageCircle size={22} /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4 justify-between text-xs text-gray-500 dark:text-gray-500">
          <p className="order-2 sm:order-1">&copy; {year} Trendology. All rights reserved.</p>
          <div className="flex items-center gap-4 order-1 sm:order-2 opacity-80">
            <Image src="/logos/bkash.webp" alt="bKash" width={40} height={24} className="object-contain" />
            <Image src="/logos/nagad.webp" alt="Nagad" width={40} height={24} className="object-contain" />
            <Image src="/logos/rocket.png" alt="Rocket" width={40} height={24} className="object-contain" />
            <Image src="/logos/upay.webp" alt="Upay" width={40} height={24} className="object-contain" />
          </div>
        </div>
      </div>
    </footer>
  )
}
