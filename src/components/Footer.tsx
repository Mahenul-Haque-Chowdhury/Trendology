import Link from "next/link";
import Image from 'next/image';
import { Facebook, Youtube, Instagram, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-700 pt-10 sm:pt-14 pb-6 border-t border-gray-200/60">
      {/* Brand / Intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm">
              <Image src="/brand-icon.png" alt="Brand" width={44} height={44} className="object-contain" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#C6AF5E] drop-shadow-sm">Trendology</h2>
              <p className="text-xs text-gray-500 leading-snug max-w-xs">Carefully Choosen Products for customer satisfaction.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* Support */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-widest mb-4 sm:mb-6 text-gray-900">SUPPORT</h3>
          <div className="mb-4 p-4 rounded-lg border border-gray-200 flex items-center gap-4 bg-white shadow-sm">
            <span className="text-2xl">📞</span>
            <div>
              <div className="text-xs text-gray-500">11 AM - 6 PM</div>
              <div className="text-xl font-bold text-orange-500">01798651950</div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 flex items-center gap-4 bg-white shadow-sm">
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-xs text-gray-500">Store Locator</div>
              <Link href="#" className="text-lg font-semibold text-orange-500 hover:underline">Find Our Stores</Link>
            </div>
          </div>
        </div>
        {/* About */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-widest mb-4 sm:mb-6 text-gray-900">ABOUT US</h3>
          <div className="grid grid-cols-2 gap-2 text-sm max-w-md">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/account/returns" className="hover:underline">Refund Policy</Link>
            <Link href="/account" className="hover:underline">My Account</Link>
            <Link href="/account/orders" className="hover:underline">Orders</Link>
            <Link href="/account/wishlist" className="hover:underline">Wishlist</Link>
          </div>
        </div>
        {/* Stay Connected */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-widest mb-4 sm:mb-6 text-gray-900">STAY CONNECTED</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed max-w-sm">80/B Gulshan-Badda Link Road, Dhaka 1212<br/>support@trendology.com</p>
          <div className="flex gap-4 text-gray-600 mb-4">
            <a href="#" aria-label="Facebook" className="hover:text-blue-600"><Facebook size={24} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-red-600"><Youtube size={24} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500"><Instagram size={24} /></a>
            <a href="#" aria-label="WhatsApp" className="hover:text-green-600"><MessageSquare size={24} /></a>
          </div>
          <div className="text-xs text-gray-400">© {new Date().getFullYear()} Trendology Ltd</div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-5">
        <p className="text-xs text-gray-500">User friendly e‑commerce site by <a href="https://arnob.life" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Arnob</a></p>
        <p className="text-xs text-gray-400">All rights reserved</p>
      </div>
    </footer>
  );
}