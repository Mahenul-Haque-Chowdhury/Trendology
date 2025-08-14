"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
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
      <aside className="card p-4 h-max sticky top-4">
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
      <section>{children}</section>
    </div>
  )
}
