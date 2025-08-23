import Image from 'next/image'
import Link from 'next/link'
import { Phone, Clock, ArrowRight, MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'

// Restored full footer with previous multi-column layout + updated phone number section
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-50 text-gray-700 pt-12 pb-8 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-start gap-3 mb-10">
          <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm">
            <Image src="/brand-icon.png" alt="Trendology logo" width={50} height={50} className="object-contain" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#C6AF5E] drop-shadow-sm">Trendology</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md">Carefully Chosen Products for customer satisfaction.</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 lg:gap-16 md:grid-cols-3">
          {/* Support Column */}
            <div>
              <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 mb-5">SUPPORT</h3>
              <div className="space-y-5">
                {/* Phone Card */}
                <a
                  href="tel:01798651950"
                  className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white/90 hover:bg-white px-5 py-4 shadow-sm transition"
                  aria-label="Call support 01798651950"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20">
                    <Phone size={24} />
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[11px] font-medium tracking-wide text-gray-500 flex items-center gap-1"><Clock size={12}/> 11 AM – 6 PM</div>
                    <div className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">01798651950</div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

          {/* About Us Column */}
          <div>
            <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 mb-5">ABOUT US</h3>
            <ul className="space-y-3 text-sm">
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/terms#refund-policy">Refund Policy</Link></li>
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/account/orders">Orders</Link></li>
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/terms">Terms &amp; Conditions</Link></li>
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/account">My Account</Link></li>
              <li><Link className="hover:text-gray-900 text-gray-600 transition" href="/account/wishlist">Wishlist</Link></li>
            </ul>
          </div>

          {/* Stay Connected Column */}
          <div>
            <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-900 mb-5">STAY CONNECTED</h3>
            <address className="not-italic text-sm text-gray-600 leading-relaxed mb-5">
              80/B Gulshan-Badda Link Road, Dhaka 1212<br />
              <a href="mailto:support@trendology.com" className="text-gray-700 hover:text-gray-900">support@trendology.com</a>
            </address>
            <div className="flex items-center gap-5">
              {/* Placeholder socials (disabled) - replace href values with real profiles */}
              <a href="#" aria-label="Facebook" aria-disabled="true" className="text-gray-400 hover:text-blue-600 transition cursor-not-allowed"><Facebook size={22} /></a>
              <a href="#" aria-label="YouTube" aria-disabled="true" className="text-gray-400 hover:text-red-600 transition cursor-not-allowed"><Youtube size={22} /></a>
              <a href="#" aria-label="Instagram" aria-disabled="true" className="text-gray-400 hover:text-pink-500 transition cursor-not-allowed"><Instagram size={22} /></a>
              <a href="#" aria-label="Message" aria-disabled="true" className="text-gray-400 hover:text-green-600 transition cursor-not-allowed"><MessageCircle size={22} /></a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-1">© {year} Trendology Ltd</div>
          <div className="flex items-center gap-1">All rights reserved</div>
          <div>User friendly e-commerce site by <a href="https://arnob.life" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Arnob</a></div>
        </div>
      </div>
    </footer>
  )
}
