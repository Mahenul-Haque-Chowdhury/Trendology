"use client"
import { useCart } from '@/lib/cart'
import { formatCurrencyBDT } from '@/lib/currency'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartDrawer() {
  const { items, total, open, setOpen, update, remove, clear } = useCart()
  const router = useRouter()
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" aria-hidden={!open}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
          >
        <header className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button className="text-gray-600 hover:text-black" onClick={() => setOpen(false)} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-9rem)]">
          {items.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-sm text-gray-600">{formatCurrencyBDT(product.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost px-2" aria-label={`Decrease ${product.name} quantity`} onClick={() => update(product.id, qty - 1)}>-</button>
                  <span className="w-8 text-center">{qty}</span>
                  <button className="btn btn-ghost px-2" aria-label={`Increase ${product.name} quantity`} onClick={() => update(product.id, qty + 1)}>+</button>
                  <button className="btn btn-ghost" onClick={() => remove(product.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <footer className="p-4 border-t flex items-center justify-between mt-auto">
            <div className="font-semibold">Total: {formatCurrencyBDT(total)}</div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
            <button className="btn btn-primary" onClick={() => { setOpen(false); router.push('/checkout') }}>Checkout</button>
          </div>
        </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
