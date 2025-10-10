'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMessage('¡Gracias por suscribirte!')
    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 rounded-xl text-green placeholder-green-light focus:ring-2 focus:ring-gold focus:outline-none"
      />
      <Button 
        type="submit" 
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
      </Button>
      {message && (
        <p className="text-center text-sm text-green-light mt-2">
          {message}
        </p>
      )}
    </form>
  )
}
