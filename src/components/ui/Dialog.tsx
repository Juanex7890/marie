'use client'

import { ReactNode, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  className?: string
}

export function Dialog({ open, onOpenChange, children, title, className }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className={cn(
        'relative bg-white rounded-2xl shadow-soft-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-sand">
            <h2 className="text-xl font-semibold text-green">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
