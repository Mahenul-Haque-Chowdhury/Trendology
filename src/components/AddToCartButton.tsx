"use client"
import { useCart } from '@/lib/cart'
import type { Product } from '@/lib/products'

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart()
  return (
    <button className="btn btn-primary" onClick={() => add(product)}>
      Add to Cart
    </button>
  )
}
