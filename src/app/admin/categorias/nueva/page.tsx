'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { createCategory } from '@/lib/actions/categories'
import { withClientTimeout } from '@/lib/utils'
import { uploadImageDirect } from '@/lib/uploadImage'

const CLIENT_UPLOAD_TIMEOUT_MS = 30000

type FormValues = {
  name: string
  description: string
  slug: string
  active: boolean
  position: number
  hero_image: string
}

export default function NewCategoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [error])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setError('No se seleccionó ninguna imagen. Si tu navegador pidió permiso para acceder a tus fotos, revisa que lo hayas concedido e inténtalo de nuevo.')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const result = await withClientTimeout(
        uploadImageDirect(file),
        CLIENT_UPLOAD_TIMEOUT_MS,
        'La subida tardó demasiado (conexión inestable). Inténtalo de nuevo.'
      )
      if (result.success) {
        setValue('hero_image', result.url)
      } else {
        setError(result.error || 'Error al subir la imagen')
      }
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError)
      setError('Error inesperado al subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const heroImage = data.hero_image.trim()
      const result = await createCategory({
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
        setError(result.error || 'Error al crear la categoria')
      }
    } catch (submitError) {
      console.error('Error creating category:', submitError)
      setError('Error inesperado al crear la categoria')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-green">Nueva Categoria</h1>
          <p className="text-green-light">Anade una nueva categoria para organizar tus productos</p>
        </div>
      </div>

      {error && (
        <div ref={errorRef} className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                    placeholder="Ej: Cojines Decorativos"
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
                    placeholder="cojines-decorativos"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Se genera a partir del nombre y se usa en la URL de la categoria.
                  </p>
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">Descripcion</label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe esta categoria..."
                    rows={3}
                    className="w-full"
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Subiendo...' : 'Subir imagen desde tu computador'}
                  </Button>
                  <p className="text-xs text-green-light mt-1">
                    JPG, PNG, WebP o HEIC, máximo 10MB.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green mb-2">URL de la imagen</label>
                  <Input
                    {...register('hero_image')}
                    placeholder="O pega un enlace: https://mi-sitio.com/imagen.jpg"
                    className="w-full"
                  />
                  <p className="text-sm text-green-light mt-1">
                    Pega un enlace directo a la imagen que quieres mostrar para esta categoria.
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
                    Aun no has agregado una imagen. Veras la vista previa cuando pegues un enlace.
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
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creando...' : 'Crear Categoria'}
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
