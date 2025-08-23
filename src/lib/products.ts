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
// Provide a small fallback sample so the grid isn't empty when Supabase is not set up.
export const products: Product[] = [
  {
    id: 'sample-1',
    name: 'Sample Wireless Headphones',
    description: 'Lightweight on‑ear wireless headphones with long battery life.',
    price: 2490,
    image: '/brand-icon.png',
    images: ['/brand-icon.png'],
    category: 'electronics',
    tags: ['audio', 'wireless'],
    created_at: new Date().toISOString(),
    active: true,
  },
  {
    id: 'sample-2',
    name: 'Sample Smart Watch',
    description: 'Fitness tracking smart watch with heart rate monitor.',
    price: 4590,
    image: '/brand-icon.png',
    images: ['/brand-icon.png'],
    category: 'wearables',
    tags: ['fitness', 'health'],
    created_at: new Date().toISOString(),
    active: true,
  },
]

// NOTE: Remove or empty this array once real products exist in Supabase so
// the fallback doesn’t mask backend loading issues.
