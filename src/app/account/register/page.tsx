"use client"
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await register(name, email, password, phone)
    if (!res.ok) return setError(res.message || 'Registration failed')
    router.push('/account')
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
