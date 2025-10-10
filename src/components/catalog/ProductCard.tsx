'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Heart } from 'lucide-react'
import { getImageUrl, formatPrice } from '@/lib/utils'

interface ProductImage {
  id: string
  file_path: string
  position: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price?: number
  active: boolean
  category_id: string
  images: ProductImage[]
  created_at: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const mainImage = product.images.find(img => img.position === 0) || product.images[0]
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  return (
    <div className="group card hover:scale-105 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden rounded-xl mb-4">
        {mainImage ? (
          <Image
            src={getImageUrl(mainImage.file_path)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-sand flex items-center justify-center">
            <span className="text-green/50 text-4xl">🛍️</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {isOnSale && (
            <Badge variant="sale">
              -{discountPercentage}%
            </Badge>
          )}
          {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <Badge variant="new">
              Nuevo
            </Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white shadow-soft"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-green group-hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-green">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Añadir
          </Button>
          <Link href={`/producto/${product.slug}`}>
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
