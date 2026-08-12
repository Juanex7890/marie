'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, X, Save, Trash2 } from 'lucide-react'
import { updateCategory, deleteCategory, getCategory } from '@/lib/actions/categories'

type FormValues = {
  name: string
  description: string
  slug: string
  active: boolean
  position: number
  hero_image: string
}

export default function EditCategoryPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      active: true,
      position: 0,
      hero_image: '',
    },
  })

  const heroImageUrl = watch('hero_image')

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setIsLoadingData(true)
        const result = await getCategory(categoryId)

        if (result.success && result.category) {
          const cat = result.category
          reset({
            name: cat.name,
            description: cat.description ?? '',
            slug: cat.slug,
            active: cat.active,
            position: cat.position,
            hero_image: cat.hero_image ?? '',
          })
        } else {
          setError(result.error || 'Error al cargar la categoria')
        }
      } catch (loadError) {
        console.error('Error fetching category:', loadError)
        setError('Error inesperado al cargar la categoria')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (categoryId) {
      loadCategory()
    }
  }, [categoryId, reset])

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true)
    setError('')

    try {
      const heroImage = data.hero_image.trim()
      const result = await updateCategory({
        id: categoryId,
        name: data.name,
        description: data.description,
        slug: data.slug,
        position: data.position || 0,
        active: data.active,
        hero_image: heroImage ? heroImage : undefined,
      })

      if (result.success) {
        router.push('/admin/categorias')
      } else {
        setError(result.error || 'Error al actualizar la categoria')
      }
    } catch (submitError) {
      console.error('Error updating category:', submitError)
      setError('Error inesperado al actualizar la categoria')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Estas seguro de eliminar esta categoria?')) {
      return
    }

    try {
      const result = await deleteCategory(categoryId)
      if (result.success) {
        router.push('/admin/categorias')
      } else {
        setError(result.error || 'Error al eliminar la categoria')
      }
    } catch (deleteError) {
      console.error('Error deleting category:', deleteError)
      setError('Error inesperado al eliminar la categoria')
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen">
        <p className="text-green">Cargando categoria...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-green">Editar Categoria</h1>
          <p className="text-green-light">Actualiza la informacion de esta categoria</p>
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
              <h3 className="text-lg font-semibold text-green mb-4">Informacion de la Categoria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green mb-2">
                    Nombre de la Categoria *
                  </label>
                  <Input
                    {...register('name', { required: 'El nombre es obligatorio' })}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">Slug (URL) *</label>
                  <Input
                    {...register('slug', { required: 'El slug es obligatorio' })}
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Se usa en la URL publica e idealmente solo contiene letras, numeros y guiones.
                  </p>
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">Descripcion</label>
                  <Textarea
                    {...register('description')}
                    rows={3}
                    className="w-full"
                    placeholder="Describe esta categoria..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">Posicion</label>
                  <Input
                    {...register('position', { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Orden de aparicion en la lista de categorias (menor numero = mas arriba).
                  </p>
                </div>
              </div>
            </Card>

            {/* Image */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">Imagen de la Categoria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green mb-2">URL de la imagen</label>
                  <Input
                    {...register('hero_image')}
                    placeholder="https://mi-sitio.com/imagen.jpg"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Usa un enlace directo a la imagen que quieres mostrar para esta categoria.
                  </p>
                </div>

                {heroImageUrl ? (
                  <div className="relative">
                    <img
                      src={heroImageUrl}
                      alt="Vista previa de la categoria"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setValue('hero_image', '')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-green-light">
                    Aun no hay una imagen asignada. Veras la vista previa cuando pegues un enlace.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">Estado de la Categoria</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('active')}
                    className="rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <label className="text-sm text-green">
                    Categoria activa (visible en la tienda)
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-green mb-4">Acciones</h3>
              <div className="space-y-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Categoria
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
