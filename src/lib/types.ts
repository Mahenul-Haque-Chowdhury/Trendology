import type { Product } from './products'

export type OrderItem = { product: Product; qty: number }
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  // Internal identifiers (optional, useful for updates)
  backendId?: string
  code?: string
  createdAt: number
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    country: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  // Optional coupon details (client-calculated)
  discount?: number
  couponCode?: string
  total: number
  payment: {
    method: 'cod' | 'bkash' | 'rocket' | 'nagad' | 'upay'
    txid?: string
  }
  // Shipping / tracking metadata (optional)
  courier?: string
  trackingNumber?: string
  placedAt?: number
  paidAt?: number
  shippedAt?: number
  deliveredAt?: number
  status: OrderStatus
  created_at: string
}
