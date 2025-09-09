"use client"
import { useState, useMemo } from 'react'
import { useUserLocation } from '@/lib/userLocation'
import Modal from './Modal'

export default function LocationSelector() {
  const { location, setLocation, districts } = useUserLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return districts
    return districts.filter(d => d.toLowerCase().includes(q))
  }, [districts, query])

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{location || 'Select Location'}</span>
      <button onClick={() => setOpen(true)} className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200">Change</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Choose Your Delivery Location" maxWidthClassName="max-w-lg">
        <div className="space-y-4">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search district..."
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <ul className="max-h-72 overflow-auto divide-y rounded-md border">
            {filtered.map(d => (
              <li key={d}>
                <button
                  onClick={() => { setLocation(d); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand/10 ${d===location ? 'bg-brand/10 font-medium text-brand' : ''}`}
                >
                  <span>{d}</span>
                  {d===location && <span className="text-xs font-semibold">Selected</span>}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="p-3 text-sm text-gray-500">No matches.</li>}
          </ul>
        </div>
      </Modal>
    </div>
  )
}
