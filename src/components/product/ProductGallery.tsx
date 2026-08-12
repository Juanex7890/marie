'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'

interface ProductImage {
  id: string | number
  file_path: string
  position?: number
}

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [images]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasImages = orderedImages.length > 0
  const currentImage = hasImages ? orderedImages[currentIndex] : null

  const showPrev = useCallback(() => {
    if (!hasImages) return
    setCurrentIndex((prev) => (prev === 0 ? orderedImages.length - 1 : prev - 1))
  }, [hasImages, orderedImages.length])

  const showNext = useCallback(() => {
    if (!hasImages) return
    setCurrentIndex((prev) => (prev === orderedImages.length - 1 ? 0 : prev + 1))
  }, [hasImages, orderedImages.length])

  const openLightbox = useCallback(() => {
    if (hasImages) {
      setLightboxOpen(true)
    }
  }, [hasImages])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  if (!hasImages) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-sand flex items-center justify-center text-green/50 shadow-soft">
        <span className="text-lg">Sin imA!genes</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-soft">
          {orderedImages.map((image, index) => (
            <Image
              key={image.id}
              src={getImageUrl(image.file_path)}
              alt={`${productName} ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                'object-cover transition-opacity duration-500',
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))}

          {orderedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Ver imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Ver siguiente imagen"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={openLightbox}
            aria-label="Ampliar imagen"
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <ZoomIn className="h-4 w-4" />
            Ampliar
          </button>
        </div>

        {orderedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {orderedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg bg-white shadow-soft transition focus:outline-none focus:ring-2 focus:ring-gold',
                  index === currentIndex ? 'ring-2 ring-gold' : 'ring-0'
                )}
              >
                <Image
                  src={getImageUrl(image.file_path)}
                  alt={`${productName} miniatura ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cerrar imagen ampliada"
            onClick={closeLightbox}
            className="absolute top-6 right-6 rounded-full bg-white/80 p-2 text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <X className="h-6 w-6" />
          </button>

          {orderedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Ver imagen anterior"
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Ver siguiente imagen"
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-green shadow-soft transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl aspect-[4/3]">
            <Image
              src={getImageUrl(currentImage.file_path)}
              alt={`${productName} ampliada`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
