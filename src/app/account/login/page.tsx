"use client"
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await login(email, password)
    if (!res.ok) return setError(res.message || 'Login failed')
    router.push('/account')
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign In</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-primary w-full">Sign In</button>
      </form>
      <div className="text-sm flex justify-between">
        <a href="/account/forgot" className="text-blue-600 hover:underline">Forgot password?</a>
        <a href="/account/register" className="text-blue-600 hover:underline">Create account</a>
      </div>
    </div>
  )
}
