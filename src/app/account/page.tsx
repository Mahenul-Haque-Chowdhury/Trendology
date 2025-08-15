"use client"
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()

  // If logged in, redirect to orders list directly
  useEffect(() => {
    if (user) router.replace('/account/orders')
  }, [user, router])

  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-gray-600">Sign in or create an account to view your orders.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }
  // Fallback UI for a brief moment while redirecting
  return (
    <div className="max-w-md mx-auto card p-6 text-center space-y-3">
      <h1 className="text-2xl font-bold">Redirecting…</h1>
      <p className="text-gray-600">Taking you to your orders.</p>
    </div>
  )
}
