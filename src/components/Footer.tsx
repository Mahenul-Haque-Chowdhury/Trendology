import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="mt-12 border-t border-gray-200 bg-surface-subtle text-gray-700">
      <div className="container mx-auto w-full max-w-[1600px] px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-sm">
          <div className="space-y-3">
            <div className="font-extrabold text-lg tracking-tight text-gray-900">AamarDokan</div>
            <p className="text-gray-600 max-w-xs">
              A clean, fast shopping experience built with Next.js and Tailwind CSS.
            </p>
          </div>
          <div className="space-y-3">
            <div className="font-bold text-gray-900">Support</div>
            <ul className="space-y-1">
              <li>
                <Link className="hover:text-brand transition-colors" href="/privacy-policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand transition-colors" href="/terms">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="font-bold text-gray-900">Contact</div>
            <ul className="space-y-1">
              <li>Email: support@aamardokan.example</li>
              <li>Hours: 9am–9pm</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="font-bold text-gray-900">Follow</div>
            <div className="flex items-center gap-4 text-gray-500">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="hover:text-brand transition-colors">
                {/* Facebook icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c-.808 0-1.608.068-2.392.203-.787.135-1.558.332-2.302.593-.744.26-1.455.59-2.128.986-.673.396-1.31.864-1.91 1.408-.6.544-1.157 1.152-1.67 1.824-.513.672-.98 1.405-1.404 2.197C.542 10.457.272 11.267.272 12c0 .733.27 1.543.684 2.327.424.792.89 1.524 1.403 2.196.513.672 1.069 1.28 1.669 1.824.6.544 1.31 1.012 1.983 1.408.673.396 1.384.726 2.128.986.744.26 1.515.457 2.302.593.784.135 1.584.203 2.392.203h2.16c.808 0 1.608-.068 2.392-.203.787-.135 1.558-.332 2.302-.593.744-.26 1.455-.59 2.128-.986.673-.396 1.31-.864 1.91-1.408.6-.544 1.157-1.152 1.67-1.824.513-.672.98-1.405 1.404-2.197.414-.784.684-1.594.684-2.327 0-.733-.27-1.543-.684-2.327-.424-.792-.89-1.524-1.403-2.196-.513-.672-1.069-1.28-1.669-1.824-.6-.544-1.31-1.012-1.983-1.408-.673-.396-1.384-.726-2.128-.986-.744-.26-1.515-.457-2.302-.593C15.828 2.231 15.028 2.163 14.22 2.163h-2.16zM15 11h-2c-1.104 0-2 .896-2 2v2h2v-2h2v-2z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="hover:text-brand transition-colors">
                {/* Instagram icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c-.808 0-1.608.068-2.392.203-.787.135-1.558.332-2.302.593-.744.26-1.455.59-2.128.986-.673.396-1.31.864-1.91 1.408-.6.544-1.157 1.152-1.67 1.824-.513.672-.98 1.405-1.404 2.197C.542 10.457.272 11.267.272 12c0 .733.27 1.543.684 2.327.424.792.89 1.524 1.403 2.196.513.672 1.069 1.28 1.669 1.824.6.544 1.31 1.012 1.983 1.408.673.396 1.384.726 2.128.986.744.26 1.515.457 2.302.593.784.135 1.584.203 2.392.203h2.16c.808 0 1.608-.068 2.392-.203.787-.135 1.558-.332 2.302-.593.744-.26 1.455-.59 2.128-.986.673-.396 1.31-.864 1.91-1.408.6-.544 1.157-1.152 1.67-1.824.513-.672.98-1.405 1.404-2.197.414-.784.684-1.594.684-2.327 0-.733-.27-1.543-.684-2.327-.424-.792-.89-1.524-1.403-2.196-.513-.672-1.069-1.28-1.669-1.824-.6-.544-1.31-1.012-1.983-1.408-.673-.396-1.384-.726-2.128-.986-.744-.26-1.515-.457-2.302-.593C15.828 2.231 15.028 2.163 14.22 2.163h-2.16zM15 11h-2c-1.104 0-2 .896-2 2v2h2v-2h2v-2z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X" className="hover:text-brand transition-colors">
                {/* X icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c-.808 0-1.608.068-2.392.203-.787.135-1.558.332-2.302.593-.744.26-1.455.59-2.128.986-.673.396-1.31.864-1.91 1.408-.6.544-1.157 1.152-1.67 1.824-.513.672-.98 1.405-1.404 2.197C.542 10.457.272 11.267.272 12c0 .733.27 1.543.684 2.327.424.792.89 1.524 1.403 2.196.513.672 1.069 1.28 1.669 1.824.6.544 1.31 1.012 1.983 1.408.673.396 1.384.726 2.128.986.744.26 1.515.457 2.302.593.784.135 1.584.203 2.392.203h2.16c.808 0 1.608-.068 2.392-.203.787-.135 1.558-.332 2.302-.593.744-.26 1.455-.59 2.128-.986.673-.396 1.31-.864 1.91-1.408.6-.544 1.157-1.152 1.67-1.824.513-.672.98-1.405 1.404-2.197.414-.784.684-1.594.684-2.327 0-.733-.27-1.543-.684-2.327-.424-.792-.89-1.524-1.403-2.196-.513-.672-1.069-1.28-1.669-1.824-.6-.544-1.31-1.012-1.983-1.408-.673-.396-1.384-.726-2.128-.986-.744-.26-1.515-.457-2.302-.593C15.828 2.231 15.028 2.163 14.22 2.163h-2.16zM15 11h-2c-1.104 0-2 .896-2 2v2h2v-2h2v-2z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-500 text-xs">
          © {currentYear} AamarDokan. All rights reserved.
        </div>
      </div>
    </footer>
  )
}