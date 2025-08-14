"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function AddressBookPage() {
  const { user } = useAuth()
  if (!user) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">Address Book</h1>
        <p>Please sign in to manage your addresses.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/account/login" className="btn btn-primary">Sign In</Link>
          <Link href="/account/register" className="btn">Create Account</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Address Book</h1>
      <p className="text-gray-600 text-sm">Coming soon: manage multiple shipping and billing addresses.</p>
    </div>
  )
}
