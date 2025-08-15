"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const sections = useMemo(() => ([
    { group: 'Manage My Account', items: [
      { href: '/account/profile', label: 'My Profile' },
      { href: '/account/address', label: 'Address Book' },
      { href: '/account/wallet', label: 'AamarWallet' },
    ]},
    { group: 'Orders', items: [
      { href: '/account/orders', label: 'My Orders' },
      { href: '/account/returns', label: 'My Returns' },
      { href: '/account/cancellations', label: 'My Cancellations' },
    ]},
    { group: 'Lists', items: [
      { href: '/account/wishlist', label: 'My Wishlist' },
    ]},
  ]), [])

  const flat = useMemo(() => sections.flatMap((g) => g.items), [sections])
  const current = useMemo(() => flat.find((i) => i.href === pathname)?.label || 'Account', [flat, pathname])

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm ${pathname === href ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}
    >
      {label}
    </Link>
  )

  const pill = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href ? 'page' : undefined}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm border ${pathname === href ? 'bg-brand border-brand text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
    </Link>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
      {/* Desktop sidebar */}
      <aside className="card p-4 h-max sticky top-4 hidden lg:block">
        <h2 className="text-lg font-semibold mb-3">Manage My Account</h2>
        <nav className="space-y-1">
          {link('/account/profile', 'My Profile')}
          {link('/account/address', 'Address Book')}
          {link('/account/wallet', 'AamarWallet')}
        </nav>
        <h2 className="text-lg font-semibold my-3">Orders</h2>
        <nav className="space-y-1">
          {link('/account/orders', 'My Orders')}
          {link('/account/returns', 'My Returns')}
          {link('/account/cancellations', 'My Cancellations')}
        </nav>
        <h2 className="text-lg font-semibold my-3">Lists</h2>
        <nav className="space-y-1">
          {link('/account/wishlist', 'My Wishlist')}
        </nav>
      </aside>

      {/* Content area */}
      <section>
        {/* Mobile: sticky, horizontally scrollable pill nav with all account links */}
        <div className="lg:hidden sticky top-2 z-10">
          <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-md border px-2 py-2 overflow-x-auto">
            <nav className="flex gap-2 min-w-0">
              {pill('/account/profile', 'Profile')}
              {pill('/account/address', 'Address')}
              {pill('/account/wallet', 'Wallet')}
              {pill('/account/orders', 'Orders')}
              {pill('/account/returns', 'Returns')}
              {pill('/account/cancellations', 'Cancellations')}
              {pill('/account/wishlist', 'Wishlist')}
            </nav>
          </div>
        </div>
        <div className="mt-3 lg:mt-0">{children}</div>
      </section>
    </div>
  )
}
