"use client"
import { useEffect, useState, useMemo, useCallback } from 'react'

export const BD_DISTRICTS: string[] = [
  'Dhaka','Faridpur','Gazipur','Gopalganj','Kishoreganj','Madaripur','Manikganj','Munshiganj','Narayanganj','Narsingdi','Rajbari','Shariatpur','Tangail',
  'Chattogram','Cox\'s Bazar','Cumilla','Brahmanbaria','Bandarban','Rangamati','Khagrachari','Feni','Noakhali','Lakshmipur','Chandpur',
  'Sylhet','Moulvibazar','Habiganj','Sunamganj',
  'Barishal','Bhola','Patuakhali','Pirojpur','Jhalokati','Barguna',
  'Khulna','Bagerhat','Satkhira','Jessore','Jhenaidah','Magura','Narail','Meherpur','Chuadanga','Kushtia',
  'Rajshahi','Natore','Pabna','Bogura','Sirajganj','Joypurhat','Naogaon','Chapai Nawabganj',
  'Rangpur','Gaibandha','Nilphamari','Kurigram','Lalmonirhat','Dinajpur','Thakurgaon','Panchagarh',
  'Mymensingh','Jamalpur','Netrokona','Sherpur'
]

const STORAGE_KEY = 'trendology.userLocation.v1'

export function useUserLocation() {
  const [location, setLocation] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setLocation(saved)
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  const update = useCallback((loc: string) => {
    setLocation(loc)
    try { localStorage.setItem(STORAGE_KEY, loc) } catch { /* ignore */ }
  }, [])

  const isDhaka = location === 'Dhaka'
  const shipping = useMemo(() => ({
    insideDhaka: 70,
    outsideDhaka: 130,
    charge: isDhaka ? 70 : 130,
    eta: isDhaka ? '2–3 working days' : '3–7 working days'
  }), [isDhaka])

  return { location, setLocation: update, ready, isDhaka, shipping, districts: BD_DISTRICTS }
}
