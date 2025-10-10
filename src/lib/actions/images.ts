'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function uploadProductImage(imageData: string, productId: string, position: number = 0) {
  try {
    console.log('🖼️ Starting image upload for product:', productId)
    
    await requireAdmin()
    console.log('✅ Admin auth passed')

    console.log('📝 Saving image record to database...')
    // Save image record to database with base64 data URL
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: productId,
        file_path: imageData,
        position: position
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error saving image record:', dbError)
      return { success: false, error: 'Error al guardar la imagen' }
    }

    console.log('✅ Image record saved successfully')
    return { 
      success: true, 
      image: imageRecord,
      url: imageData
    }
  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return { success: false, error: 'Error inesperado al subir la imagen' }
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    await requireAdmin()

    // Get image record first
    const { data: image, error: fetchError } = await supabaseAdmin
      .from('product_images')
      .select('file_path')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return { success: false, error: 'Imagen no encontrada' }
    }

    // Extract file path from URL
    const url = new URL(image.file_path)
    const filePath = url.pathname.split('/').slice(-2).join('/') // Get 'products/filename'

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([filePath])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Error deleting image record:', dbError)
      return { success: false, error: 'Error al eliminar la imagen' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error: 'Error inesperado al eliminar la imagen' }
  }
}

export async function getProductImages(productId: string) {
  try {
    await requireAdmin()

    const { data: images, error } = await supabaseAdmin
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching images:', error)
      return { success: false, error: 'Error al cargar las imágenes' }
    }

    return { success: true, images: images || [] }
  } catch (error) {
    console.error('Error fetching images:', error)
    return { success: false, error: 'Error inesperado al cargar las imágenes' }
  }
}
