"use client"
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await register(name, email, password, phone)
    if (!res.ok) return setError(res.message || 'Registration failed')
    // Do not auto-redirect; prompt user to verify email
    setSuccessEmail(email)
  }

  async function resend() {
    try {
      if (!successEmail) return
      if (!isSupabaseConfigured()) return
      const supabase = getSupabaseClient()!
      await supabase.auth.resend({ type: 'signup', email: successEmail })
    } catch {}
  }

  if (successEmail) {
    return (
      <div className="max-w-md mx-auto card p-6 space-y-4 text-center">
        <div className="text-4xl">📧</div>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-sm text-gray-700">
          We sent a verification link to <strong>{successEmail}</strong>. Please check your inbox (and spam) to activate your account.
        </p>
        <div className="flex gap-2 justify-center">
          <button className="btn btn-primary" onClick={() => router.push('/account/login')}>Go to Login</button>
          {isSupabaseConfigured() && (
            <button className="btn" onClick={resend}>Resend Email</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create Account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Mobile number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-primary w-full">Sign Up</button>
      </form>
    </div>
  )
}
