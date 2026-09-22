'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { LinktreeView } from '@/components/linktree/LinktreeView'
import { getLinktreeConfigForAdmin, saveLinktreeConfig } from '@/lib/actions/linktree'
import { uploadImageDirect } from '@/lib/uploadImage'
import { withClientTimeout } from '@/lib/utils'
import type { LinktreeConfig, LinktreeLink } from '@/lib/firebase/db'
import { Upload, X, Plus, ArrowUp, ArrowDown, Trash2, Save } from 'lucide-react'

const CLIENT_UPLOAD_TIMEOUT_MS = 30000

type EditableConfig = Omit<LinktreeConfig, 'updated_at'>

const EMPTY_CONFIG: EditableConfig = {
  displayName: '',
  bio: '',
  avatarUrl: '',
  backgroundType: 'gradient',
  backgroundColor: '#FAF6EF',
  backgroundGradientFrom: '#FAF6EF',
  backgroundGradientTo: '#DCCBB3',
  backgroundImageUrl: '',
  buttonColor: '#264733',
  buttonTextColor: '#FFFFFF',
  buttonShape: 'pill',
  textColor: '#264733',
  fontFamily: 'sans',
  links: [],
}

function newLink(position: number): LinktreeLink {
  return { id: crypto.randomUUID(), title: '', url: '', imageUrl: '', active: true, position }
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-green mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 rounded-lg border border-sand cursor-pointer bg-white"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
    </div>
  )
}

export default function LinktreeAdminPage() {
  const [config, setConfig] = useState<EditableConfig>(EMPTY_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const result = await getLinktreeConfigForAdmin()
      if (result.success) {
        const { updated_at, ...rest } = result.config
        setConfig(rest)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [error])

  const updateLink = (id: string, patch: Partial<LinktreeLink>) => {
    setConfig((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    }))
  }

  const addLink = () => {
    setConfig((prev) => ({ ...prev, links: [...prev.links, newLink(prev.links.length)] }))
  }

  const removeLink = (id: string) => {
    setConfig((prev) => ({ ...prev, links: prev.links.filter((link) => link.id !== id) }))
  }

  const moveLink = (index: number, direction: -1 | 1) => {
    setConfig((prev) => {
      const links = [...prev.links]
      const target = index + direction
      if (target < 0 || target >= links.length) return prev
      ;[links[index], links[target]] = [links[target], links[index]]
      return { ...prev, links }
    })
  }

  const handleImageUpload = async (
    key: string,
    file: File | undefined,
    onUploaded: (url: string) => void
  ) => {
    if (!file) {
      setError('No se seleccionó ninguna imagen. Revisa los permisos de tu navegador e inténtalo de nuevo.')
      return
    }
    setUploadingKey(key)
    setError('')
    try {
      const result = await withClientTimeout(
        uploadImageDirect(file),
        CLIENT_UPLOAD_TIMEOUT_MS,
        'La subida tardó demasiado (conexión inestable). Inténtalo de nuevo.'
      )
      if (result.success) {
        onUploaded(result.url)
      } else {
        setError(result.error || 'Error al subir la imagen')
      }
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError)
      setError('Error inesperado al subir la imagen')
    } finally {
      setUploadingKey(null)
      const input = fileInputs.current[key]
      if (input) input.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess(false)
    try {
      const result = await saveLinktreeConfig(config)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Error al guardar la configuración')
      }
    } catch (saveError) {
      console.error('Error saving linktree config:', saveError)
      setError('Error inesperado al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-green">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-green">Linktree</h1>
          <p className="text-green-light">
            Personaliza la página de enlaces que compartes en tus redes sociales
          </p>
        </div>
        <a href="/links" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">Ver página pública</Button>
        </a>
      </div>

      {error && (
        <div ref={errorRef} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green">Cambios guardados correctamente.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-green mb-4">Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green mb-2">Nombre a mostrar *</label>
                <Input
                  value={config.displayName}
                  onChange={(e) => setConfig((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Cojines Marie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green mb-2">Biografía</label>
                <Textarea
                  value={config.bio}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={2}
                  placeholder="Cuéntale a tus visitantes quién eres..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green mb-2">Foto de perfil</label>
                <div className="flex items-center gap-4">
                  {config.avatarUrl && (
                    <div className="relative">
                      <img
                        src={config.avatarUrl}
                        alt="Vista previa"
                        className="h-16 w-16 rounded-full object-cover border border-sand"
                      />
                      <button
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, avatarUrl: '' }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={(el) => { fileInputs.current.avatar = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload('avatar', e.target.files?.[0], (url) =>
                        setConfig((prev) => ({ ...prev, avatarUrl: url }))
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingKey === 'avatar'}
                    onClick={() => fileInputs.current.avatar?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingKey === 'avatar' ? 'Subiendo...' : 'Subir foto'}
                  </Button>
                </div>
                <Input
                  className="mt-3"
                  value={config.avatarUrl}
                  onChange={(e) => setConfig((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="O pega un enlace directo a la imagen"
                />
              </div>
            </div>
          </Card>

          {/* Theme */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-green mb-4">Apariencia</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-green mb-2">Fondo</label>
                <div className="flex gap-2">
                  {(['solid', 'gradient', 'image'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, backgroundType: type }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        config.backgroundType === type
                          ? 'bg-green text-white border-green'
                          : 'bg-white text-green border-sand hover:border-green'
                      }`}
                    >
                      {type === 'solid' ? 'Color sólido' : type === 'gradient' ? 'Degradado' : 'Imagen'}
                    </button>
                  ))}
                </div>
              </div>

              {config.backgroundType === 'solid' && (
                <ColorField
                  label="Color de fondo"
                  value={config.backgroundColor}
                  onChange={(value) => setConfig((prev) => ({ ...prev, backgroundColor: value }))}
                />
              )}

              {config.backgroundType === 'gradient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField
                    label="Color inicial"
                    value={config.backgroundGradientFrom}
                    onChange={(value) => setConfig((prev) => ({ ...prev, backgroundGradientFrom: value }))}
                  />
                  <ColorField
                    label="Color final"
                    value={config.backgroundGradientTo}
                    onChange={(value) => setConfig((prev) => ({ ...prev, backgroundGradientTo: value }))}
                  />
                </div>
              )}

              {config.backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-green mb-2">Imagen de fondo</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={(el) => { fileInputs.current.background = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload('background', e.target.files?.[0], (url) =>
                          setConfig((prev) => ({ ...prev, backgroundImageUrl: url }))
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingKey === 'background'}
                      onClick={() => fileInputs.current.background?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingKey === 'background' ? 'Subiendo...' : 'Subir imagen'}
                    </Button>
                  </div>
                  <Input
                    className="mt-3"
                    value={config.backgroundImageUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundImageUrl: e.target.value }))}
                    placeholder="O pega un enlace directo a la imagen"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorField
                  label="Color de los botones"
                  value={config.buttonColor}
                  onChange={(value) => setConfig((prev) => ({ ...prev, buttonColor: value }))}
                />
                <ColorField
                  label="Color del texto de los botones"
                  value={config.buttonTextColor}
                  onChange={(value) => setConfig((prev) => ({ ...prev, buttonTextColor: value }))}
                />
                <ColorField
                  label="Color del nombre y biografía"
                  value={config.textColor}
                  onChange={(value) => setConfig((prev) => ({ ...prev, textColor: value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green mb-2">Forma de los botones</label>
                  <select
                    value={config.buttonShape}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, buttonShape: e.target.value as EditableConfig['buttonShape'] }))
                    }
                    className="w-full px-4 py-3 border border-sand rounded-xl bg-white focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="pill">Redondeado (píldora)</option>
                    <option value="rounded">Redondeado suave</option>
                    <option value="square">Cuadrado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green mb-2">Tipografía</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, fontFamily: e.target.value as EditableConfig['fontFamily'] }))
                    }
                    className="w-full px-4 py-3 border border-sand rounded-xl bg-white focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="sans">Moderna (sans-serif)</option>
                    <option value="serif">Elegante (serif)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Links */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green">Enlaces</h3>
              <Button type="button" variant="outline" onClick={addLink}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir enlace
              </Button>
            </div>

            {config.links.length === 0 && (
              <p className="text-sm text-green-light">Aún no has añadido ningún enlace.</p>
            )}

            <div className="space-y-4">
              {config.links.map((link, index) => {
                const uploadKey = `link-${link.id}`
                return (
                  <div key={link.id} className="border border-sand rounded-xl p-4 space-y-3 bg-linen/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-sand text-green disabled:opacity-40 hover:border-green"
                          aria-label="Subir enlace"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === config.links.length - 1}
                          className="p-1.5 rounded-lg border border-sand text-green disabled:opacity-40 hover:border-green"
                          aria-label="Bajar enlace"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-green">
                        <input
                          type="checkbox"
                          checked={link.active}
                          onChange={(e) => updateLink(link.id, { active: e.target.checked })}
                          className="rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        Activo
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="text-red-500 hover:text-red-600 p-1.5"
                        aria-label="Eliminar enlace"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        placeholder="Título (ej: Catálogo, WhatsApp...)"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      {link.imageUrl && (
                        <img
                          src={link.imageUrl}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover border border-sand flex-shrink-0"
                        />
                      )}
                      <input
                        ref={(el) => { fileInputs.current[uploadKey] = el }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(uploadKey, e.target.files?.[0], (url) =>
                            updateLink(link.id, { imageUrl: url })
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingKey === uploadKey}
                        onClick={() => fileInputs.current[uploadKey]?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        {uploadingKey === uploadKey ? 'Subiendo...' : 'Icono'}
                      </Button>
                      <Input
                        value={link.imageUrl ?? ''}
                        onChange={(e) => updateLink(link.id, { imageUrl: e.target.value })}
                        placeholder="O pega un enlace a un icono/imagen"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-green-light uppercase tracking-wide mb-3 text-center">
                Vista previa
              </h3>
              <div className="rounded-3xl border border-sand overflow-hidden h-[560px] overflow-y-auto">
                <LinktreeView config={{ ...config, updated_at: '' } as LinktreeConfig} />
              </div>
            </Card>

            <Button type="button" onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
