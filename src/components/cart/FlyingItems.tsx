'use client'

import { AnimatePresence, motion } from 'framer-motion'

export interface FlyingItem {
  id: number
  src: string
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  endX: number
  endY: number
}

interface FlyingItemsProps {
  items: FlyingItem[]
  onItemComplete: (id: number) => void
}

export function FlyingItems({ items, onItemComplete }: FlyingItemsProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <AnimatePresence>
        {items.map((item) => {
          const midX = (item.startX + item.endX) / 2
          return (
            <motion.div
              key={item.id}
              initial={{
                left: item.startX,
                top: item.startY,
                width: item.startWidth,
                height: item.startHeight,
                opacity: 1,
                rotate: 0,
                borderRadius: 16,
              }}
              animate={{
                left: [item.startX, midX, item.endX - 14],
                top: [item.startY, item.startY - 120, item.endY - 14],
                width: [item.startWidth, item.startWidth * 0.55, 28],
                height: [item.startHeight, item.startHeight * 0.55, 28],
                opacity: [1, 1, 0.3],
                rotate: [0, 12, -8, 0],
                borderRadius: [16, 16, 9999],
              }}
              transition={{ duration: 0.75, times: [0, 0.55, 1], ease: 'easeInOut' }}
              onAnimationComplete={() => onItemComplete(item.id)}
              style={{
                position: 'fixed',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
