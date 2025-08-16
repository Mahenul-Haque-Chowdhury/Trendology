import type { Product } from './products'

export type OrderItem = { product: Product; qty: number }
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export type Order = {
  id: string
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
    method: 'cod' | 'bkash' | 'rocket' | 'nagad'
    txid?: string
  }
  status: OrderStatus
}
