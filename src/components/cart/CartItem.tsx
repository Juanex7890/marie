'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from './CartProvider'
import { getImageUrl, formatPrice } from '@/lib/utils'

interface CartItemProps {
  item: {
    id: string
    name: string
    slug: string
    price: number
    image?: string
    quantity: number
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity)
  }

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6 bg-white rounded-2xl shadow-soft">
      <div className="flex items-start gap-5">
        <Link href={`/producto/${item.slug}`} className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative overflow-hidden rounded-xl">
            {item.image ? (
              <Image
                src={getImageUrl(item.image)}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-sand flex items-center justify-center">
                <span className="text-green/50 text-3xl">🛍️</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/producto/${item.slug}`}>
            <h3 className="text-lg sm:text-xl font-semibold text-green hover:text-gold transition-colors line-clamp-2">
              {item.name}
            </h3>
          </Link>
          <p className="text-base text-gray-600 mt-1">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-sand pt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span className="w-10 text-center text-base font-medium">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="h-10 w-10 p-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-lg font-semibold text-green">
            {formatPrice(item.price * item.quantity)}
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
            className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
