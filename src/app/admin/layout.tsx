"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/db', label: 'DB Check' },
  ]
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Admin</h1>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-medium border ${active ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'}`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
