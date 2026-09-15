'use server'

import { randomUUID } from 'crypto'
import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'
import { firebaseStorage } from '@/lib/firebase/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024

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

    const bytes = Buffer.from(await file.arrayBuffer())
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `uploads/${randomUUID()}.${extension}`
    const downloadToken = randomUUID()

    const bucket = firebaseStorage().bucket()
    await bucket.file(path).save(bytes, {
      contentType: file.type,
      metadata: {
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`

    return { success: true as const, url }
  } catch (error) {
    console.error('Error uploading image file:', error)
    return { success: false as const, error: 'Error inesperado al subir la imagen' }
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
