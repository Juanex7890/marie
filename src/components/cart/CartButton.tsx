'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from './CartProvider'
import { useFlyToCart } from './FlyToCartProvider'
import { Badge } from '@/components/ui/Badge'

export function CartButton() {
  const { getTotalItems } = useCart()
  const { cartBump } = useFlyToCart()
  const totalItems = getTotalItems()

  return (
    <Link href="/cart" className="relative">
      <motion.div
        key={cartBump}
        data-cart-icon-target
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.3, 0.9, 1] }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-2 hover:bg-sand/50 rounded-xl transition-colors"
      >
        <ShoppingCart className="h-6 w-6 text-green" />
        {totalItems > 0 && (
          <Badge
            variant="sale"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {totalItems}
          </Badge>
        )}
      </motion.div>
    </Link>
  )
}
