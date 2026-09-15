'use server'

import { randomUUID } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_TIMEOUT_MS = 20000

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Faltan las variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)'
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudinary
}

export async function uploadImageFile(formData: FormData) {
  try {
    await requireAdmin()

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { success: false as const, error: 'No se seleccionó ningún archivo' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false as const, error: 'El archivo debe ser una imagen' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false as const, error: 'La imagen no debe superar 5MB' }
    }

    const client = getCloudinaryClient()
    const bytes = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`

    const result = await withTimeout(
      client.uploader.upload(dataUri, {
        folder: 'cojines-marie',
        public_id: randomUUID(),
        resource_type: 'image',
      }),
      UPLOAD_TIMEOUT_MS,
      'Tiempo de espera agotado subiendo la imagen a Cloudinary'
    )

    return { success: true as const, url: result.secure_url }
  } catch (error) {
    console.error('Error uploading image file:', error)
    const message = error instanceof Error ? error.message : 'Error inesperado al subir la imagen'
    return { success: false as const, error: message }
  }
}

export async function uploadProductImage(imageData: string, productId: string, position: number = 0) {
  try {
    await requireAdmin()

    const image = await db.addImage({
      product_id: productId,
      file_path: imageData,
      position,
    })

    return {
      success: true as const,
      image,
      url: imageData
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false as const, error: 'Error inesperado al subir la imagen' }
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    await requireAdmin()

    const image = await db.getImage(imageId)
    if (!image) {
      return { success: false as const, error: 'Imagen no encontrada' }
    }

    await db.deleteImage(imageId)

    return { success: true as const }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false as const, error: 'Error inesperado al eliminar la imagen' }
  }
}

export async function getProductImages(productId: string) {
  try {
    await requireAdmin()

    const images = await db.getImages(productId)
    return { success: true as const, images }
  } catch (error) {
    console.error('Error fetching images:', error)
    return { success: false as const, error: 'Error inesperado al cargar las imágenes' }
  }
}
