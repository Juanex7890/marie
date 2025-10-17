'use client'

import { useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/catalog/ProductCard'

type ProductImage = {
  id: string
  file_path: string
  position: number
}

type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price?: number | null
  active: boolean
  category_id: string
  best_seller?: boolean
  images: ProductImage[]
  created_at: string
}

interface BestSellersMarqueeProps {
  products: Product[]
}

const AUTO_SCROLL_SPEED = 0.4
const RESUME_DELAY = 1500

export function BestSellersMarquee({ products }: BestSellersMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startAutoScrollRef = useRef<() => void>(() => {})
  const stopAutoScrollRef = useRef<() => void>(() => {})

  const duplicatedProducts = useMemo(
    () => (products.length ? [...products, ...products] : []),
    [products]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || duplicatedProducts.length === 0) {
      startAutoScrollRef.current = () => {}
      stopAutoScrollRef.current = () => {}
      return
    }

    let running = false

    const clearResumeTimeout = () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
        resumeTimeoutRef.current = null
      }
    }

    const step = () => {
      if (!running) {
        return
      }

      const halfWidth = container.scrollWidth / 2
      container.scrollLeft += AUTO_SCROLL_SPEED

      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
      }

      animationFrameRef.current = requestAnimationFrame(step)
    }

    const start = () => {
      if (running) {
        return
      }

      running = true
      animationFrameRef.current = requestAnimationFrame(step)
    }

    const stop = () => {
      running = false

      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }
    }

    startAutoScrollRef.current = () => {
      clearResumeTimeout()
      start()
    }

    stopAutoScrollRef.current = () => {
      clearResumeTimeout()
      stop()
    }

    const setInitialScroll = () => {
      const halfWidth = container.scrollWidth / 2
      container.scrollLeft = halfWidth / 2
    }

    requestAnimationFrame(setInitialScroll)

    const scheduleResume = () => {
      clearResumeTimeout()
      resumeTimeoutRef.current = setTimeout(() => {
        start()
      }, RESUME_DELAY)
    }

    const handleScroll = () => {
      const halfWidth = container.scrollWidth / 2

      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth
      }
    }

    const handlePointerDown = () => {
      stop()
      clearResumeTimeout()
    }

    const handlePointerUp = () => {
      scheduleResume()
    }

    container.addEventListener('scroll', handleScroll)
    container.addEventListener('mouseenter', handlePointerDown)
    container.addEventListener('mouseleave', handlePointerUp)
    container.addEventListener('touchstart', handlePointerDown)
    container.addEventListener('touchend', handlePointerUp)
    container.addEventListener('wheel', handlePointerDown)
    container.addEventListener('wheel', handlePointerUp)

    start()

    return () => {
      stop()
      clearResumeTimeout()
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('mouseenter', handlePointerDown)
      container.removeEventListener('mouseleave', handlePointerUp)
      container.removeEventListener('touchstart', handlePointerDown)
      container.removeEventListener('touchend', handlePointerUp)
      container.removeEventListener('wheel', handlePointerDown)
      container.removeEventListener('wheel', handlePointerUp)
    }
  }, [duplicatedProducts])

  const pauseAutoScroll = (delay = RESUME_DELAY) => {
    stopAutoScrollRef.current()

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }

    resumeTimeoutRef.current = setTimeout(() => {
      startAutoScrollRef.current()
    }, delay)
  }

  const handleArrowClick = (direction: 'left' | 'right') => {
    const container = containerRef.current
    if (!container) {
      return
    }

    pauseAutoScroll(2000)

    const firstCard = container.querySelector<HTMLElement>('[data-card]')
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 260
    const computedStyles = getComputedStyle(container)
    const gap =
      parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0
    const scrollAmount =
      direction === 'left' ? -(cardWidth + gap) : cardWidth + gap

    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!duplicatedProducts.length) {
    return null
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-linen via-linen/70 to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-linen via-linen/70 to-transparent z-10"
        aria-hidden="true"
      />

      <div className="relative">
        <div
          ref={containerRef}
          className="no-scrollbar flex gap-6 overflow-x-scroll py-4"
          role="list"
          aria-label="Productos más vendidos"
        >
          {duplicatedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              data-card
              className="flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px]"
              role="listitem"
              aria-hidden={index >= products.length}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleArrowClick('left')}
          onMouseEnter={() => stopAutoScrollRef.current()}
          onMouseLeave={() => pauseAutoScroll()}
          className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-sand bg-white/90 text-green shadow-soft transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label="Ver productos anteriores"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => handleArrowClick('right')}
          onMouseEnter={() => stopAutoScrollRef.current()}
          onMouseLeave={() => pauseAutoScroll()}
          className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-sand bg-white/90 text-green shadow-soft transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label="Ver productos siguientes"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
