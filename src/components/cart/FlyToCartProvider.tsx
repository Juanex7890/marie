'use client'

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { FlyingItem } from './FlyingItems'

// framer-motion is only needed once the user adds something to the cart, so
// it's kept out of the initial JS bundle every page pays for on first load.
const FlyingItems = dynamic(() => import('./FlyingItems').then((mod) => mod.FlyingItems), {
  ssr: false,
})

interface FlyToCartContextType {
  flyToCart: (source: HTMLElement | null, imageSrc: string) => void
  cartBump: number
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined)

// Cap how large the flying thumbnail starts, regardless of the source
// element's real size — otherwise it's the full gallery image on mobile.
const MAX_START_SIZE = 88

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([])
  const [cartBump, setCartBump] = useState(0)
  const nextId = useRef(0)

  const flyToCart = useCallback((source: HTMLElement | null, imageSrc: string) => {
    if (!source || typeof window === 'undefined') return

    const target = Array.from(
      document.querySelectorAll<HTMLElement>('[data-cart-icon-target]')
    ).find((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })
    if (!target) return

    const startRect = source.getBoundingClientRect()
    const endRect = target.getBoundingClientRect()

    // Prefer the already-rendered <img>'s resolved src so the flying copy
    // reuses the browser's cached, decoded image instead of re-fetching the
    // raw (unoptimized) URL from scratch mid-animation.
    const sourceImg = source.querySelector('img')
    const resolvedSrc = sourceImg?.currentSrc || sourceImg?.src || imageSrc
    if (!resolvedSrc) return

    const scale = Math.min(1, MAX_START_SIZE / Math.max(startRect.width, startRect.height))
    const startWidth = startRect.width * scale
    const startHeight = startRect.height * scale
    const centerX = startRect.left + startRect.width / 2
    const centerY = startRect.top + startRect.height / 2

    const id = nextId.current++
    setFlyingItems((prev) => [
      ...prev,
      {
        id,
        src: resolvedSrc,
        startX: centerX - startWidth / 2,
        startY: centerY - startHeight / 2,
        startWidth,
        startHeight,
        endX: endRect.left + endRect.width / 2,
        endY: endRect.top + endRect.height / 2,
      },
    ])
  }, [])

  const removeFlyingItem = useCallback((id: number) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id))
    setCartBump((prev) => prev + 1)
  }, [])

  return (
    <FlyToCartContext.Provider value={{ flyToCart, cartBump }}>
      {children}
      {flyingItems.length > 0 && (
        <FlyingItems items={flyingItems} onItemComplete={removeFlyingItem} />
      )}
    </FlyToCartContext.Provider>
  )
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext)
  if (context === undefined) {
    throw new Error('useFlyToCart must be used within a FlyToCartProvider')
  }
  return context
}
