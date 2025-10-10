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
    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-soft">
      <Link href={`/producto/${item.slug}`} className="flex-shrink-0">
        <div className="w-16 h-16 relative overflow-hidden rounded-lg">
          {item.image ? (
            <Image
              src={getImageUrl(item.image)}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-sand flex items-center justify-center">
              <span className="text-green/50 text-lg">🛍️</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/producto/${item.slug}`}>
          <h3 className="text-sm font-medium text-green hover:text-gold transition-colors line-clamp-2">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mt-1">
          {formatPrice(item.price)}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-right min-w-[80px]">
          <p className="text-sm font-medium text-green">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(item.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
