"use client"
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useAddresses, type Address } from '@/lib/addresses'
import { useEffect, useState } from 'react'

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
  return <AddressManager userId={user.id} />
}

function AddressManager({ userId }: { userId: string }) {
  const { user } = useAuth()
  const { addresses, add, remove, setDefault } = useAddresses(userId)
  const [form, setForm] = useState<Omit<Address, 'id' | 'user_id' | 'created_at'>>({
    label: 'Home', recipient: '', phone: '', address_line: '', city: '', country: 'Bangladesh', is_default: false,
  })
  const [busy, setBusy] = useState(false)

  // Prefill recipient/phone from cached profile or auth metadata
  useEffect(() => {
    try {
      let cached: any = null
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`storefront.user_details.${userId}`)
        cached = raw ? JSON.parse(raw) : null
      }
      const recipient = cached?.name || user?.name || ''
      const phone = cached?.phone || (user as any)?.user_metadata?.phone || ''
      setForm((prev) => ({ ...prev, recipient: prev.recipient || recipient, phone: prev.phone || phone }))
    } catch {}
  }, [userId, user])

  // If no addresses exist yet, default the new one to is_default
  useEffect(() => {
    if (addresses.length === 0) setForm((prev) => ({ ...prev, is_default: true }))
  }, [addresses.length])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try { await add(form) } finally { setBusy(false) }
    setForm({ label: 'Home', recipient: '', phone: '', address_line: '', city: '', country: 'Bangladesh', is_default: false })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">Address Book</h1>
        {addresses.length === 0 ? (
          <div className="text-gray-600 text-sm">No addresses yet. Add your first address below.</div>
        ) : (
          <ul className="divide-y">
            {addresses.map((a) => (
              <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {a.label || 'Address'} {a.is_default && <span className="ml-2 text-xs rounded px-2 py-0.5 bg-green-100 text-green-700">Default</span>}
                  </div>
                  <div className="text-sm text-gray-700">{a.recipient} {a.phone ? `· ${a.phone}` : ''}</div>
                  <div className="text-sm text-gray-500">{a.address_line}, {a.city}, {a.country}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!a.is_default && <button className="btn btn-sm" onClick={() => setDefault(a.id!)}>Make Default</button>}
                  <button className="btn btn-sm btn-outline" onClick={() => remove(a.id!)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Add New Address</h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <input className="input" placeholder="Label (Home/Office)" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="input" placeholder="Recipient" value={form.recipient || ''} onChange={(e) => setForm({ ...form, recipient: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="input sm:col-span-2" placeholder="Address Line" value={form.address_line || ''} onChange={(e) => setForm({ ...form, address_line: e.target.value })} required />
          <input className="input" placeholder="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <input className="input" placeholder="Country" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          <label className="flex items-center gap-2 text-sm sm:col-span-2 mt-1">
            <input type="checkbox" checked={!!form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Set as default
          </label>
          <div className="sm:col-span-2">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

