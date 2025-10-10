import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-gold hover:bg-gold/90 text-white shadow-soft hover:shadow-soft-lg focus:ring-gold',
      secondary: 'bg-green hover:bg-green-light text-white shadow-soft hover:shadow-soft-lg focus:ring-green',
      outline: 'border-2 border-green text-green hover:bg-green hover:text-white focus:ring-green',
      ghost: 'text-green hover:bg-green/10 focus:ring-green',
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
