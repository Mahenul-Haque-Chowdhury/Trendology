import Link from "next/link";
import { Facebook, Youtube, Instagram, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-700 pt-12 sm:pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold tracking-widest mb-6 text-gray-900">SUPPORT</h3>
          <div className="mb-4 p-4 rounded-lg border border-gray-200 flex items-center gap-4 bg-white">
            <span className="text-2xl">📞</span>
            <div>
              <div className="text-xs text-gray-500">11 AM - 6 PM</div>
              <div className="text-xl font-bold text-orange-500">01798651950</div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 flex items-center gap-4 bg-white">
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-xs text-gray-500">Store Locator</div>
              <Link href="#" className="text-lg font-semibold text-orange-500 hover:underline">Find Our Stores</Link>
            </div>
          </div>
        </div>
        {/* About Us */}
        <div>
          <h3 className="text-lg font-semibold tracking-widest mb-6 text-gray-900">ABOUT US</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Refund and Return Policy</Link>
            <Link href="#" className="hover:underline">Blog</Link>
            <Link href="#" className="hover:underline">Contact Us</Link>
            <Link href="#" className="hover:underline">About Us</Link>
            <Link href="#" className="hover:underline">Terms and Conditions</Link>
          </div>
        </div>
        {/* Stay Connected */}
        <div>
          <h3 className="text-lg font-semibold tracking-widest mb-6 text-gray-900">STAY CONNECTED</h3>
          <div className="mb-2 font-semibold">AamarDokan Ltd</div>
          <div className="text-sm text-gray-500 mb-2">
            Head Office: 80/B Gulshan-Badda Link Road, Dhaka 1212
          </div>
          <div className="text-sm font-semibold mb-1">Email:</div>
          <div className="text-orange-500 mb-4">support@aamardokan.com</div>
          <div className="flex gap-4 text-gray-600">
            <a href="#" aria-label="Facebook" className="hover:text-blue-600">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-red-600">
              <Youtube size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500">
              <Instagram size={24} />
            </a>
            <a href="#" aria-label="WhatsApp" className="hover:text-green-600">
              <MessageSquare size={24} />
            </a>
          </div>
        </div>
      </div>
      {/* Developer Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 text-sm">
          <span>
            User Friendly Minimalistic E-commerce Site by{" "}
            <a 
              href="https://arnob.life" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-medium"
            >
              Arnob
            </a>
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2 md:mt-0">
          © 2025 AamarDokan Ltd | All rights reserved
        </div>
      </div>
    </footer>
  );
}