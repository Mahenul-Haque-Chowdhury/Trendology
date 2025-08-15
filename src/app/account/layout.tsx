"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm ${pathname === href ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}
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
        {/* Mobile compact header */}
        <div className="lg:hidden sticky top-2 z-10">
          <div className="card px-3 py-2 flex items-center justify-between">
            <div className="font-medium truncate">{current}</div>
            <button className="btn btn-sm" onClick={() => setMobileOpen(true)} aria-haspopup="dialog" aria-expanded={mobileOpen}>
              Menu
            </button>
          </div>
        </div>
        <div className="mt-2 lg:mt-0">{children}</div>
      </section>

      {/* Mobile bottom-sheet menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-xl p-4 max-h-[80vh] overflow-y-auto">
            {sections.map((group) => (
              <div key={group.group} className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">{group.group}</div>
                <nav className="space-y-1">
                  {group.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`block rounded-md px-3 py-2 text-sm ${pathname === it.href ? 'bg-brand text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {it.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
            <div className="pt-2">
              <button className="btn w-full" onClick={() => setMobileOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
