'use client'

import { useMemo } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

export default function CartPage() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const { shippingCost, totalWithShipping, whatsappUrl } = useMemo(() => {
    const shipping = totalPrice >= 50000 ? 0 : 15000
    const total = totalPrice + shipping

    const orderLines = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - ${formatPrice(
            item.price * item.quantity
          )}`
      )
      .join('\n')

    const whatsappMessage = [
      'Hola, me gustaría confirmar mi compra en Cojines Marie.',
      '',
      'Resumen del pedido:',
      orderLines,
      '',
      `Productos: ${formatPrice(totalPrice)}`,
      `Envío: ${shipping === 0 ? 'Gratis' : formatPrice(shipping)}`,
      `Total a pagar: ${formatPrice(total)}`,
      '',
      'Datos de envío:',
      '• Nombre y apellido:',
      '• Dirección completa:',
      '• Ciudad:',
      '• Teléfono de contacto:',
      '',
      '¿Podrían confirmarme disponibilidad y medios de pago? ¡Gracias!'
    ]
      .filter(Boolean)
      .join('\n')

    const url = `https://wa.me/573166388242?text=${encodeURIComponent(
      whatsappMessage
    )}`

    return {
      shippingCost: shipping,
      totalWithShipping: total,
      whatsappUrl: url
    }
  }, [items, totalPrice])

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-linen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-serif font-bold text-green mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-lg text-green-light mb-8">
              Explora nuestra colección y añade algunos productos a tu carrito
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categorias">
                <Button size="lg">Ver categorías</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Ver productos destacados
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-green mb-2">
            Tu carrito
          </h1>
          <p className="text-green-light">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu
            carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-green mb-4">
                Resumen del pedido
              </h3>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-green-light">
                    Subtotal ({totalItems} productos)
                  </span>
                  <span className="text-green font-medium">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-green-light">Envío</span>
                  <span className="text-green font-medium">
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="border-t border-sand pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-green">Total</span>
                    <span className="text-green">
                      {formatPrice(totalWithShipping)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#101828] px-8 py-4 text-lg font-medium text-white transition duration-200 hover:bg-[#0C1526]"
                >
                  <WhatsAppIcon className="h-6 w-6" />
                  Finalizar por WhatsApp
                </a>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={clearCart}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Vaciar carrito
                </Button>
              </div>

              <p className="mt-4 text-sm text-green-light">
                Al pulsar “Finalizar por WhatsApp” se abrirá una conversación
                con el resumen del pedido para que nos indiques la dirección de
                entrega y acordemos el pago.
              </p>

              {totalPrice < 50000 && (
                <div className="mt-4 rounded-xl bg-gold/10 p-3">
                  <p className="text-sm text-gold">
                    <Badge variant="new" className="mr-2">
                      ¡Envío gratis!
                    </Badge>
                    Añade {formatPrice(50000 - totalPrice)} más para envío
                    gratuito
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
