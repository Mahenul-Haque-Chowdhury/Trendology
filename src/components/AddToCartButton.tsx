"use client"
import { useCart } from '@/lib/cart'
import { useToast } from './ToastStack'
import type { Product } from '@/lib/products'

export default function AddToCartButton({ product }: { product: Product }) {
  const { add, setOpen, remove: removeFromCart } = useCart()
  const { push } = useToast()
  return (
    <button
      className="btn btn-primary h-11 px-6 rounded-full shadow-md hover:shadow-lg transition"
      onClick={() => {
        add(product, 1, { openDrawer: false })
        push({
          title: 'Great! Item Added to Cart',
          message: `"${product.name}" was successfully added to your cart`,
          actionLabel: 'Go to Cart',
          onAction: () => setOpen(true),
          dismissLabel: 'Remove',
          onDismiss: () => removeFromCart(product.id),
          variant: 'success',
          duration: 6500
        })
      }}
    >
      Add to Cart
    </button>
  )
}
