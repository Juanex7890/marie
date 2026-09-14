'use client'

import { useRef } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/components/cart/CartProvider'
import { useFlyToCart } from '@/components/cart/FlyToCartProvider'
import { getImageUrl } from '@/lib/utils'

interface ProductImage {
  id: string
  file_path: string
  position: number
}

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: ProductImage[]
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { flyToCart } = useFlyToCart()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    const mainImage = product.images?.find((img) => img.position === 0) || product.images?.[0]
    const source = document.getElementById('product-gallery-main-image') ?? buttonRef.current

    if (source && mainImage) {
      flyToCart(source, getImageUrl(mainImage.file_path))
    }

    addItem(product)
  }

  return (
    <Button ref={buttonRef} size="lg" className="flex-1" onClick={handleClick}>
      <ShoppingCart className="h-5 w-5 mr-2" />
      Añadir al carrito
    </Button>
  )
}
