'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react'
import { updateCategory, deleteCategory, getCategory } from '@/lib/actions/categories'

export default function EditCategoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [image, setImage] = useState<string | null>(null)
  const [category, setCategory] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id

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
      slug: '',
      active: true,
      position: 0,
    }
  })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoadingData(true)
        const result = await getCategory(categoryId as string)

        if (result.success && result.category) {
          setCategory(result.category)
          setImage(result.category.hero_image)
          reset({
            name: result.category.name,
            description: result.category.description,
            slug: result.category.slug,
            position: result.category.position,
            active: result.category.active,
          })
        } else {
          setError(result.error || 'Error al cargar la categoría')
        }
      } catch (error) {
        console.error('Error fetching category:', error)
        setError('Error inesperado al cargar la categoría')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await updateCategory({
        id: categoryId as string,
        name: data.name,
        description: data.description,
        slug: data.slug,
        position: data.position || 0,
        active: data.active,
        hero_image: image ?? undefined,
      })

      if (result.success) {
        router.push('/admin/categorias')
      } else {
        setError(result.error || 'Error al actualizar la categoría')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Error inesperado al actualizar la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        const result = await deleteCategory(categoryId as string)
        if (result.success) {
          router.push('/admin/categorias')
        } else {
          setError(result.error || 'Error al eliminar la categoría')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        setError('Error inesperado al eliminar la categoría')
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Implement image upload logic
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
    }
  }

  const removeImage = () => {
    setImage(null)
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-green-light">Cargando categoría...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-green mb-2">
          Categoría no encontrada
        </h3>
        <p className="text-green-light mb-6">
          La categoría que buscas no existe o ha sido eliminada
        </p>
        <Button onClick={() => router.push('/admin/categorias')}>
          Volver a Categorías
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
              Editar Categoría
            </h1>
            <p className="text-green-light">
              Modifica la información de la categoría
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Información de la Categoría
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Nombre de la Categoría *
                  </label>
                  <Input
                    {...register('name', { required: 'El nombre es obligatorio' })}
                    placeholder="Ej: Cojines Decorativos"
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
                    Slug (URL) *
                  </label>
                  <Input
                    {...register('slug', { required: 'El slug es obligatorio' })}
                    placeholder="cojines-decorativos"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Usado en la URL de la categoría. Debe ser único.
                  </p>
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Descripción
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe esta categoría..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Posición
                  </label>
                  <Input
                    {...register('position', { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Orden de aparición en la lista de categorías (menor número = más arriba)
                  </p>
                </div>
              </div>
            </Card>

            {/* Image */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Imagen de la Categoría
              </h3>
              <div className="space-y-4">
                {!image ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-green-light mb-2">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-green hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Imagen
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">
                Estado de la Categoría
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('active')}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <label className="text-sm text-green">
                    Categoría activa (visible en la tienda)
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
