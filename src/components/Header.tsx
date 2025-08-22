"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, User, Menu, X, ChevronDown, Grid3x3
} from 'lucide-react'

// Dummy/Placeholder components and hooks - replace with your actual implementations
import type { Product } from '@/lib/products'
import { useAuth } from '@/lib/auth'
import { useCatalog } from '@/lib/catalog'
import { CATEGORIES } from '@/lib/categories'
import { formatCurrencyBDT } from '@/lib/currency'
import CartButton from './CartButton' // Assuming these are separate components
import WishlistButton from './WishlistButton'

// Reusable Search Suggestions Component to avoid duplication
type SearchSuggestionsProps = {
  suggestions: Product[]
  activeIndex: number
  close: () => void
}

function SearchSuggestions({ suggestions, activeIndex, close }: SearchSuggestionsProps) {
  return (
    <div
      className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg overflow-hidden"
      role="listbox"
      // Prevent the input from losing focus when a suggestion is clicked
      onMouseDown={(e) => e.preventDefault()}
    >
      <ul className="max-h-80 overflow-auto divide-y">
        {suggestions.map((p, idx) => (
          <li key={p.id} role="option" aria-selected={idx === activeIndex}>
            <Link
              href={`/products/${p.id}`}
              className={`flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 outline-none ${idx === activeIndex ? 'bg-gray-50' : ''}`}
              onClick={close}
            >
              {p.image ? (
                <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-gray-100">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="w-12 h-12 shrink-0 rounded bg-gray-100" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-gray-500 truncate">{p.category} • {formatCurrencyBDT(p.price)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}


export default function Header() {
  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  
  // Data & Hooks
  const { products: items } = useCatalog()
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Search State
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Refs for managing focus and clicks
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const catMenuRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null)
  const desktopInputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Memoized search suggestions
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    return items
      .filter((p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(term))) ||
        (p.description && p.description.toLowerCase().includes(term))
      )
      .slice(0, 8)
  }, [query, items])

  // Handlers
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (query) params.set('q', query)
    else params.delete('q')
    router.push(`/?${params.toString()}#products`)
    setShowSuggestions(false)
    if (mobileSearchOpen) setMobileSearchOpen(false)
  }

  const handleSignOut = useCallback(async () => {
    setShowSignOutModal(false)
    await logout()
  }, [logout])

  const closeSignOutModal = useCallback(() => {
    setShowSignOutModal(false)
    previouslyFocusedRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setShowSuggestions(true)
        setActiveIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setShowSuggestions(true)
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        if (activeIndex > -1 && suggestions[activeIndex]) {
          e.preventDefault()
          router.push(`/products/${suggestions[activeIndex].id}`)
          setShowSuggestions(false)
          if (mobileSearchOpen) setMobileSearchOpen(false)
        } else {
          handleSearchSubmit()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  // Effect: Initialize search query from URL
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  // Effect: Handle outside clicks for dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (categoryMenuOpen && catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        setCategoryMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [userMenuOpen, categoryMenuOpen])

  // Effect: Focus management for sign-out modal
  useEffect(() => {
    if (!showSignOutModal) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusableElements) return
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    const handleTabKeyPress = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignOutModal()
    }

    document.addEventListener('keydown', handleTabKeyPress)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleTabKeyPress)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showSignOutModal, closeSignOutModal])

  // Effect: Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 100)
    }
  }, [mobileSearchOpen])
  
  return (
    <header className="sticky top-0 z-40">
      {/* Promo bar */}
      <div className="bg-amber-300 text-gray-900 text-xs sm:text-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-2 text-center">
          <span className="font-medium">Free delivery on orders over ৳5000!</span>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden btn-icon"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="shrink-0 font-extrabold text-2xl sm:text-3xl text-brand tracking-tight focus-visible:ring-2 focus-visible:ring-brand rounded-sm">
              AamarDokan
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <div className="relative" ref={catMenuRef}>
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 h-11 rounded-l-md border border-gray-300 bg-gray-50 px-4 shadow-sm hover:bg-gray-100 focus:border-brand focus:ring-2 focus:ring-brand z-10"
                  aria-haspopup="menu" aria-expanded={categoryMenuOpen}
                >
                  <Grid3x3 size={18} />
                  <span className="hidden lg:inline text-sm font-medium">Categories</span>
                  <ChevronDown size={16} className={`transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  role="menu"
                  className={`absolute z-20 mt-2 w-56 origin-top-left rounded-md border bg-white shadow-xl transition-all duration-200 ease-out ${categoryMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 translate-y-1'}`}
                >
                  <div className="max-h-80 overflow-auto py-1">
                    {CATEGORIES.map((c) => (
                      <Link key={c.slug} href={`/category/${c.slug}`} role="menuitem"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setCategoryMenuOpen(false)}
                      >{c.label}</Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex-1">
                <input
                  ref={desktopInputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIndex(-1) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full h-11 border-y border-r border-gray-300 bg-white px-4 pl-10 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand -ml-px"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </span>
                {showSuggestions && suggestions.length > 0 && (
                  <SearchSuggestions suggestions={suggestions} activeIndex={activeIndex} close={() => setShowSuggestions(false)} />
                )}
              </div>
              <button type="submit" className="btn btn-primary rounded-l-none h-11 shrink-0">Search</button>
            </form>
          </div>

          {/* Right-side actions */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden btn-icon"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <WishlistButton />
            <CartButton />
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button className="btn-icon" onClick={() => setUserMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={userMenuOpen} aria-label="Account">
                  <User size={22} />
                </button>
              ) : (
                <Link href="/account" className="btn-icon" aria-label="Account">
                  <User size={22} />
                </Link>
              )}
              {user && userMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-xl p-2 z-20">
                  <p className="px-2 py-1 text-sm text-gray-500">Hi, {user.name.split(' ')[0]}</p>
                  <hr className="my-1"/>
                  <Link href="/account/profile" role="menuitem" className="menu-item" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                  <Link href="/account/orders" role="menuitem" className="menu-item" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                  <button role="menuitem" className="menu-item text-red-600 w-full text-left"
                    onClick={() => { setUserMenuOpen(false); setShowSignOutModal(true) }}
                  >Sign Out</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileMenuOpen}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)}/>
        <aside className={`absolute left-0 top-0 h-full w-80 max-w-[calc(100vw-3rem)] bg-white shadow-xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <header className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-lg">Menu</span>
            <button className="btn-icon -mr-2" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={24}/></button>
          </header>
          <nav className="p-4 space-y-2">
            {user ? (
              <>
                <Link href="/account/profile" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link href="/account/orders" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              </>
            ) : (
              <Link href="/account" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>Sign In / Register</Link>
            )}
             <hr/>
            <details className="group">
              <summary className="mobile-menu-item flex justify-between cursor-pointer select-none">Categories <ChevronDown size={20} className="group-open:rotate-180 transition-transform"/></summary>
              <div className="mt-2 ml-4 space-y-1 border-l pl-4">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>{c.label}</Link>
                ))}
              </div>
            </details>
            {user && <button onClick={() => { setMobileMenuOpen(false); setShowSignOutModal(true) }} className="mobile-menu-item text-red-600 w-full text-left mt-6">Sign Out</button>}
          </nav>
        </aside>
      </div>
      
      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileSearchOpen(false)}>
          <div className="absolute top-0 left-0 right-0 p-4 bg-white border-b" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={mobileInputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIndex(-1) }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full h-11 rounded-md border border-gray-300 bg-white px-4 pl-10 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={20} /></span>
                {showSuggestions && suggestions.length > 0 && (
                  <SearchSuggestions suggestions={suggestions} activeIndex={activeIndex} close={() => setMobileSearchOpen(false)} />
                )}
              </div>
              <button type="button" className="btn-icon" aria-label="Close search" onClick={() => setMobileSearchOpen(false)}><X size={24}/></button>
            </form>
          </div>
        </div>
      )}

      {/* Sign out confirmation modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="signout-title">
          <div className="fixed inset-0 bg-black/50" onClick={closeSignOutModal} />
          <div ref={modalRef} className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 id="signout-title" className="text-lg font-semibold mb-2">Sign Out</h2>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <button className="btn" onClick={closeSignOutModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}