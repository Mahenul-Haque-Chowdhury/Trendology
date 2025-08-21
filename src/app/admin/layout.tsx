// src/app/admin/layout.tsx

"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

// Define navigation links outside the component to prevent re-creation on every render.
const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/db', label: 'DB Check' },
]

/**
 * Provides the shared layout for all admin pages.
 *
 * NOTE: Page access is protected by Next.js middleware, which handles
 * authentication and authorization on the server-side. This layout component
 * is focused only on the UI structure.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Panel
          </h1>
          <nav className="flex items-center gap-2">
            {ADMIN_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}