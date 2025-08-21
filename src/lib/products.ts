// Product type used across the app. Supabase (products/inventory tables) is the
// source of truth. We keep the local seed empty to avoid confusion.
export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: string[]
  category: string
  tags: string[]
  created_at: string
  // Whether the product is visible/available in the store (from Supabase inventory.active)
  active?: boolean
}

// Empty local seed; the app loads from Supabase.
export const products: Product[] = []

// If you ever want local sample data for offline dev, you can temporarily add
// items here or use localStorage via the admin UI. Keeping this empty ensures
// the UI reflects your Supabase inventory.
