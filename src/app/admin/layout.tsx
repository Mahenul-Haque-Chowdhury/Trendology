"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/db', label: 'DB Check' },
  ]
  useEffect(() => {
    const mode = (process.env.NEXT_PUBLIC_ADMIN_AUTH_MODE || '').toLowerCase()
    if (mode !== 'supabase') return
    // Client-side soft guard: redirect non-admins to login page
    async function check() {
      const supabase = getSupabaseClient()
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      const user = data.user
      const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      const isAdmin = user && ((emails.length > 0 && emails.includes(String(user.email || '').toLowerCase())) || String(user.user_metadata?.role || '').toLowerCase() === 'admin')
      if (!isAdmin) router.replace('/account/login')
    }
    check()
  }, [router])
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
