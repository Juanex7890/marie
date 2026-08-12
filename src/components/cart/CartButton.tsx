'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { Badge } from '@/components/ui/Badge'

export function CartButton() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <Link href="/cart" className="relative">
      <div className="p-2 hover:bg-sand/50 rounded-xl transition-colors">
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
