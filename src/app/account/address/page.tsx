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
  const { addresses, add, update, remove, setDefault } = useAddresses(userId)
  const [form, setForm] = useState<Omit<Address, 'id' | 'user_id' | 'created_at'>>({
    label: 'Home', recipient: '', phone: '', address_line: '', city: '', country: 'Bangladesh', is_default: false,
  })
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label?: string } | null>(null)

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
    <>
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">Address Book</h1>
        {addresses.length === 0 ? (
          <div className="text-gray-600 text-sm">No addresses yet. Add your first address below.</div>
        ) : (
          <ul className="divide-y">
            {addresses.map((a) => (
              <li key={a.id} className="py-3">
                {editingId === a.id ? (
                  <EditableAddressCard
                    address={a}
                    onCancel={() => setEditingId(null)}
                    onSave={async (patch) => { await update(a.id!, patch); setEditingId(null) }}
                    onDelete={() => setConfirmDelete({ id: a.id!, label: a.label })}
                    onMakeDefault={() => setDefault(a.id!)}
                  />
                ) : (
                  <ReadOnlyAddressCard
                    address={a}
                    onEdit={() => setEditingId(a.id!)}
                    onDelete={() => setConfirmDelete({ id: a.id!, label: a.label })}
                    onMakeDefault={() => setDefault(a.id!)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Add New Address</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-2" onSubmit={onSubmit}>
          <div className="field">
      <div className="text-xs text-gray-600 mb-0.5">Label</div>
            <input className="input" placeholder="Home / Office" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="field">
      <div className="text-xs text-gray-600 mb-0.5">Recipient</div>
            <input className="input" placeholder="Full name" value={form.recipient || ''} onChange={(e) => setForm({ ...form, recipient: e.target.value })} required />
          </div>
          <div className="field">
      <div className="text-xs text-gray-600 mb-0.5">Phone</div>
            <input className="input" placeholder="e.g. 01XXXXXXXXX" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="field sm:col-span-2">
      <div className="text-xs text-gray-600 mb-0.5">Address Line</div>
            <input className="input" placeholder="Street, area, house no." value={form.address_line || ''} onChange={(e) => setForm({ ...form, address_line: e.target.value })} required />
          </div>
          <div className="field">
      <div className="text-xs text-gray-600 mb-0.5">City</div>
            <input className="input" placeholder="City" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="field">
      <div className="text-xs text-gray-600 mb-0.5">Country</div>
            <input className="input" placeholder="Country" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
              Set as default
            </label>
          </div>
          <div className="sm:col-span-2">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
    {confirmDelete && (
      <ConfirmDialog
        title="Delete address?"
        description={`Are you sure you want to delete "${confirmDelete.label || 'this address'}"?`}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => { await remove(confirmDelete.id); setConfirmDelete(null) }}
      />
    )}
    </>
  )
}

function ReadOnlyAddressCard({ address, onEdit, onDelete, onMakeDefault }: {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onMakeDefault: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-medium">
          {address.label || 'Address'} {address.is_default && <span className="ml-2 text-xs rounded px-2 py-0.5 bg-green-100 text-green-700">Default</span>}
        </div>
        <div className="text-sm text-gray-700">{address.recipient} {address.phone ? `· ${address.phone}` : ''}</div>
        <div className="text-sm text-gray-500">{address.address_line}, {address.city}, {address.country}</div>
      </div>
      <div className="flex items-center gap-2">
        {!address.is_default && <button className="btn btn-sm" onClick={onMakeDefault}>Make Default</button>}
        <button className="btn btn-sm" onClick={onEdit}>Edit</button>
        <button className="btn btn-sm btn-outline" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

function EditableAddressCard({ address, onCancel, onSave, onDelete, onMakeDefault }: {
  address: Address
  onCancel: () => void
  onSave: (patch: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>) => void | Promise<void>
  onDelete: () => void
  onMakeDefault: () => void
}) {
  const [draft, setDraft] = useState<Partial<Address>>({ ...address })
  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      onSubmit={(e) => { e.preventDefault(); onSave({
        label: draft.label,
        recipient: draft.recipient,
        phone: draft.phone,
        address_line: draft.address_line,
        city: draft.city,
        country: draft.country,
      }) }}
    >
      <div className="field">
        <div className="text-xs text-gray-600 mb-0.5">Label</div>
        <input className="input" placeholder="Home / Office" value={draft.label || ''} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
      </div>
      <div className="field">
        <div className="text-xs text-gray-600 mb-0.5">Recipient</div>
        <input className="input" placeholder="Full name" value={draft.recipient || ''} onChange={(e) => setDraft({ ...draft, recipient: e.target.value })} required />
      </div>
      <div className="field">
        <div className="text-xs text-gray-600 mb-0.5">Phone</div>
        <input className="input" placeholder="e.g. 01XXXXXXXXX" value={draft.phone || ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} required />
      </div>
      <div className="field sm:col-span-2">
        <div className="text-xs text-gray-600 mb-0.5">Address Line</div>
        <input className="input" placeholder="Street, area, house no." value={draft.address_line || ''} onChange={(e) => setDraft({ ...draft, address_line: e.target.value })} required />
      </div>
      <div className="field">
        <div className="text-xs text-gray-600 mb-0.5">City</div>
        <input className="input" placeholder="City" value={draft.city || ''} onChange={(e) => setDraft({ ...draft, city: e.target.value })} required />
      </div>
      <div className="field">
        <div className="text-xs text-gray-600 mb-0.5">Country</div>
        <input className="input" placeholder="Country" value={draft.country || ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} required />
      </div>
      <div className="sm:col-span-2 flex items-center gap-2">
        {!address.is_default && <button className="btn btn-sm" type="button" onClick={onMakeDefault}>Make Default</button>}
        <button className="btn btn-sm btn-primary" type="submit">Save</button>
        <button className="btn btn-sm" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-sm btn-outline ml-auto" type="button" onClick={onDelete}>Delete</button>
      </div>
    </form>
  )
}

function ConfirmDialog({ title, description, onCancel, onConfirm }: { title: string; description?: string; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5 space-y-3">
        <div className="text-lg font-semibold">{title}</div>
        {description && <div className="text-sm text-gray-600">{description}</div>}
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  )
}

