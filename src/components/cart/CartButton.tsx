'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useFlyToCart } from './FlyToCartProvider'
import { Badge } from '@/components/ui/Badge'

export function CartButton() {
  const { getTotalItems } = useCart()
  const { cartBump } = useFlyToCart()
  const totalItems = getTotalItems()

  return (
    <Link href="/cart" className="relative" aria-label="Ver carrito">
      <div
        key={cartBump}
        data-cart-icon-target
        className="p-2 hover:bg-sand/50 rounded-xl transition-colors animate-cart-bump"
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
      </div>
    </Link>
  )
}
