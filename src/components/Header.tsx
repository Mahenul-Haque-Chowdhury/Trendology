"use client"
import Link from 'next/link'
import CartButton from './CartButton'
import { useMemo, useState, useEffect, useRef } from 'react'
import { products } from '@/lib/products'
import { useAuth } from '@/lib/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCatalog } from '@/lib/catalog'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { products: items } = useCatalog()
  const categories = useMemo(() => Array.from(new Set(items.map((p) => p.category))).sort(), [items])
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [q, setQ] = useState('')
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  // Initialize from URL once
  useEffect(() => {
    const initial = searchParams.get('q') ?? ''
    setQ(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submitSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (q) params.set('q', q)
    else params.delete('q')
    const next = `/?${params.toString()}#products`
    router.push(next)
  }

  // Close user menu on outside click or Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userOpen) return
      const el = userMenuRef.current
      if (el && e.target instanceof Node && !el.contains(e.target)) setUserOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setUserOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey) }
  }, [userOpen])

  return (
    <header className="sticky top-0 z-40">
      {/* Promo bar */}
      <div className="bg-accent text-gray-900 text-xs sm:text-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2">
          <span className="font-medium">Free delivery on orders over $50</span>
          <Link href="/account" className="underline underline-offset-2 hover:text-gray-800">Join now</Link>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
  <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/" className="shrink-0 font-extrabold text-2xl sm:text-3xl text-brand tracking-tight focus-visible:ring-2 focus-visible:ring-brand">
              AamarDokan
            </Link>
            {/* Search */}
            <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search products"
                  placeholder="Search for products, categories, tags"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                  {/* Search icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
              <button type="submit" className="btn btn-primary shrink-0">Search</button>
            </form>
          </div>

          {/* Right-side actions */}
          <nav className="flex items-center gap-4 sm:gap-6 text-sm relative">
            <Link href="/" className="hover:text-brand-dark hidden sm:inline">Home</Link>
            <Link href="#products" className="hover:text-brand-dark hidden sm:inline">Products</Link>
            <div className="relative hidden sm:block">
              <button className="hover:text-brand-dark" onClick={() => setOpen((s) => !s)} aria-haspopup="menu" aria-expanded={open} aria-controls="category-menu">Categories ▾</button>
              {open && (
                <div id="category-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-md p-2 z-50">
                  {categories.map((c) => (
                    <Link key={c} href={`/category/${c}`} role="menuitem" className="block px-2 py-1 rounded hover:bg-gray-50" onClick={() => setOpen(false)}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="hover:text-brand-dark"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                  aria-controls="user-menu"
                >
                  {`Hi, ${user.name.split(' ')[0]}`} ▾
                </button>
                {userOpen && (
                  <div id="user-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-md p-2 z-50">
                    <Link href="/account/profile" role="menuitem" className="block px-2 py-1 rounded hover:bg-gray-50" onClick={() => setUserOpen(false)}>
                      Manage your Profile
                    </Link>
                    <Link href="/" role="menuitem" className="block px-2 py-1 rounded hover:bg-gray-50" onClick={() => setUserOpen(false)}>
                      Home
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/account" className="hover:text-brand-dark">Account</Link>
            )}
            <CartButton />
            {/* Mobile hamburger */}
            <button
              className="sm:hidden ml-1 rounded-md border px-2 py-1 hover:bg-gray-50"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="container mx-auto px-4 pb-3 md:hidden">
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search products"
                placeholder="Search products"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 sm:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Mobile navigation"
        >
          <header className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold">Menu</span>
            <button className="text-gray-600 hover:text-black" aria-label="Close menu" onClick={() => setMobileOpen(false)}>✕</button>
          </header>
          <nav className="p-4 space-y-2 text-sm">
            <Link href="/" className="block px-2 py-2 rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Home</Link>
            <a href="#products" className="block px-2 py-2 rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Products</a>
            <details className="px-2 py-2">
              <summary className="cursor-pointer select-none">Categories</summary>
              <div className="mt-2 ml-3 space-y-1 max-h-60 overflow-auto pr-2">
                {categories.map((c) => (
                  <Link key={c} href={`/category/${c}`} className="block px-2 py-1 rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/account" className="block px-2 py-2 rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Account'}</Link>
          </nav>
        </aside>
      </div>
    </header>
  )
}
