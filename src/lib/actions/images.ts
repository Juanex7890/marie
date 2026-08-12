'use server'

import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'

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
