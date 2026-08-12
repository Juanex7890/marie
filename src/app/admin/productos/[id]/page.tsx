'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Plus, X, Upload, Save, Trash2 } from 'lucide-react'
import { updateProduct, deleteProduct, getProduct } from '@/lib/actions/products'
import { getAllCategories } from '@/lib/actions/categories'
import { uploadProductImage, deleteProductImage, getProductImages } from '@/lib/actions/images'
import { testConnection } from '@/lib/actions/test-connection'

export default function EditProductPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [newImageUrls, setNewImageUrls] = useState<string[]>([''])
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState('')
  const [testResult, setTestResult] = useState('')
  const router = useRouter()
  const params = useParams()
  const productId = params.id

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category_id: '',
      active: true,
      best_seller: false,
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        
        // Fetch product and categories in parallel
        const [productResult, categoriesResult] = await Promise.all([
          getProduct(productId as string),
          getAllCategories()
        ])

        if (productResult.success && productResult.product) {
          setProduct(productResult.product)
          setExistingImages(productResult.product.images || [])
          reset({
            name: productResult.product.name,
            description: productResult.product.description,
            price: productResult.product.price.toString(),
            category_id: productResult.product.category_id,
            active: productResult.product.active,
            best_seller: productResult.product.best_seller ?? false,
          })
        } else {
          setError(productResult.error || 'Error al cargar el producto')
        }

        if (categoriesResult.success) {
          setCategories(categoriesResult.categories || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Error inesperado al cargar los datos')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId, reset])

  const onSubmit = async (data: any) => {
    console.log('🚀 Starting product update...')
    setIsLoading(true)
    setError('')
    
    try {
      console.log('📝 Updating product data:', {
        id: productId,
        name: data.name,
        price: data.price,
        category_id: data.category_id
      })

      // First update the product
      const result = await updateProduct({
        id: productId as string,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category_id: data.category_id,
        active: data.active,
        best_seller: data.best_seller,
      })

      console.log('📊 Update result:', result)

      if (!result.success) {
        console.error('❌ Product update failed:', result.error)
        setError(result.error || 'Error al actualizar el producto')
        return
      }

      console.log('✅ Product updated successfully')

      // Save new image URLs to database
      if (newImageUrls.length > 0 && newImageUrls[0].trim()) {
        console.log('🖼️ Saving', newImageUrls.length, 'new image URLs...')
        const startPosition = existingImages.length
        for (let i = 0; i < newImageUrls.length; i++) {
          if (newImageUrls[i].trim()) {
            try {
              console.log(`📤 Saving image URL ${i + 1}/${newImageUrls.length}`)
              const imageResult = await uploadProductImage(newImageUrls[i].trim(), productId as string, startPosition + i)
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

      console.log('🎉 Product update completed successfully!')
      router.push('/admin/productos')
    } catch (error) {
      console.error('❌ Error updating product:', error)
      setError('Error inesperado al actualizar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const result = await deleteProduct(productId as string)
        if (result.success) {
          router.push('/admin/productos')
        } else {
          setError(result.error || 'Error al eliminar el producto')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        setError('Error inesperado al eliminar el producto')
      }
    }
  }


  const removeExistingImage = async (imageId: string) => {
    const result = await deleteProductImage(imageId)
    if (result.success) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
    } else {
      setError(result.error || 'Error al eliminar la imagen')
    }
  }

  const handleTestConnection = async () => {
    const result = await testConnection()
    setTestResult(JSON.stringify(result, null, 2))
  }

  const addImageUrl = () => {
    setNewImageUrls(prev => [...prev, ''])
  }

  const updateImageUrl = (index: number, url: string) => {
    setNewImageUrls(prev => prev.map((item, i) => i === index ? url : item))
  }

  const removeImageUrl = (index: number) => {
    setNewImageUrls(prev => prev.filter((_, i) => i !== index))
  }


  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-green-light">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-green mb-2">
          Producto no encontrado
        </h3>
        <p className="text-green-light mb-6">
          El producto que buscas no existe o ha sido eliminado
        </p>
        <Button onClick={() => router.push('/admin/productos')}>
          Volver a Productos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              Editar Producto
            </h1>
            <p className="text-green-light">
              Modifica la información del producto
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Debug Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-800">Debug Connection</h3>
          <Button onClick={handleTestConnection} size="sm" variant="outline">
            Test Connection
          </Button>
        </div>
        {testResult && (
          <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-auto max-h-40">
            {testResult}
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
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green">Imágenes actuales:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.file_path}
                            alt="Product image"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image URLs */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-green">Añadir nuevas imágenes:</h4>
                  {newImageUrls.map((url, index) => (
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

                {/* New Image Previews */}
                {newImageUrls.some(url => url.trim()) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green">Vista previa de nuevas imágenes:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newImageUrls.map((url, index) => (
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
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('best_seller')}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <label className="text-sm text-green">
                    Mostrar en "Más Vendidos"
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
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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
