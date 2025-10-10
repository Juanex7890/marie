'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Plus, X, Upload } from 'lucide-react'
import { createProduct } from '@/lib/actions/products'
import { getAllCategories } from '@/lib/actions/categories'
import { uploadProductImage } from '@/lib/actions/images'
import { debugProductCreation } from '@/lib/actions/debug'
import { checkEnvironment } from '@/lib/actions/env-check'

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState('')
  const [debugResult, setDebugResult] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category_id: '',
      active: true,
    }
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getAllCategories()
      if (result.success) {
        setCategories(result.categories || [])
      }
    }
    fetchCategories()
  }, [])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')
    
    try {
      // First create the product
      const result = await createProduct({
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category_id: data.category_id,
        active: data.active,
      })

      if (!result.success) {
        setError(result.error || 'Error al crear el producto')
        return
      }

      // Save image URLs to database
      if (imageUrls.length > 0 && imageUrls[0].trim()) {
        console.log('🖼️ Saving', imageUrls.length, 'image URLs...')
        for (let i = 0; i < imageUrls.length; i++) {
          if (imageUrls[i].trim()) {
            try {
              console.log(`📤 Saving image URL ${i + 1}/${imageUrls.length}`)
              const imageResult = await uploadProductImage(imageUrls[i].trim(), result.product.id, i)
              if (imageResult.success) {
                console.log('✅ Image URL saved successfully')
              } else {
                console.error('❌ Error saving image URL:', imageResult.error)
              }
            } catch (error) {
              console.error('❌ Error saving image URL:', error)
            }
          }
        }
      }

      router.push('/admin/productos')
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Error inesperado al crear el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const addImageUrl = () => {
    setImageUrls(prev => [...prev, ''])
  }

  const updateImageUrl = (index: number, url: string) => {
    setImageUrls(prev => prev.map((item, i) => i === index ? url : item))
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }


  const handleDebug = async () => {
    const [envResult, debugResult] = await Promise.all([
      checkEnvironment(),
      debugProductCreation()
    ])
    setDebugResult(JSON.stringify({ env: envResult, debug: debugResult }, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-green">
            Nuevo Producto
          </h1>
          <p className="text-green-light">
            Añade un nuevo producto a tu catálogo
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-800">Debug Information</h3>
          <Button onClick={handleDebug} size="sm" variant="outline">
            Run Debug Test
          </Button>
        </div>
        {debugResult && (
          <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-auto max-h-40">
            {debugResult}
          </pre>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Nombre del Producto *
                  </label>
                  <Input
                    {...register('name', { required: 'El nombre es obligatorio' })}
                    placeholder="Ej: Cojín Decorativo Verde"
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Descripción
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe tu producto..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green mb-2">
                      Precio (€) *
                    </label>
                    <Input
                      {...register('price', { required: 'El precio es obligatorio' })}
                      type="number"
                      step="0.01"
                      placeholder="29.99"
                      className="w-full"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green mb-2">
                      Categoría *
                    </label>
                    <select
                      {...register('category_id', { required: 'La categoría es obligatoria' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Imágenes del Producto
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImageUrl(index)}
                        className="px-3"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageUrl}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir URL de Imagen
                  </Button>
                </div>

                {/* Image Previews */}
                {imageUrls.some(url => url.trim()) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      url.trim() && (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Error'
                            }}
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Estado del Producto
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('active')}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <label className="text-sm text-green">
                    Producto activo (visible en la tienda)
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Acciones
              </h3>
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creando...' : 'Crear Producto'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
