"use client"
import { useEffect, useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

type Check = {
  name: string
  ok: boolean
  details?: string
}

export default function DbCheckPage() {
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        return
      }
      const supabase = getSupabaseClient()!
      const results: Check[] = []

      async function tableExists(table: string): Promise<Check> {
        const res = await supabase.from(table).select('*', { count: 'exact', head: true }).limit(1)
        if (res.error) {
          const code = (res.error as any).code || ''
          const msg = res.error.message || 'Unknown error'
          if (code === '42P01' || (msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('does not exist'))) {
            return { name: table, ok: false, details: 'Table not found' }
          }
          return { name: table, ok: false, details: msg }
        }
        return { name: table, ok: true, details: 'OK' }
      }

      const toCheck = ['products', 'inventory', 'wishlists', 'user_addresses']
      for (const t of toCheck) {
        try { results.push(await tableExists(t)) } catch (e: any) { results.push({ name: t, ok: false, details: String(e?.message || e) }) }
      }

      setChecks(results)
    }
    run()
  }, [])

  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-bold">Database Health Check</h1>
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {!error && !checks && <div className="text-sm text-gray-600">Checking Supabase…</div>}
      {!error && checks && (
        <div className="space-y-3">
          {checks.map((c) => (
            <div key={c.name} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.details && <div className="text-xs text-gray-500 mt-0.5">{c.details}</div>}
              </div>
              <span className={`text-xs px-2 py-1 rounded ${c.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {c.ok ? 'Present' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500">
        Tip: If wishlists or user_addresses are missing, open Supabase → SQL Editor and run the SQL at
        <code className="ml-1">SUPABASE_SQL_FOR_YOUR_TABLES.sql</code> (bottom section).
      </div>
    </div>
  )
}
