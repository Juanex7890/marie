'use server'

import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CreateCategoryData {
  name: string
  description?: string
  slug: string
  position: number
  active: boolean
  hero_image?: string
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: string
}

export async function createCategory(data: CreateCategoryData) {
  try {
    await requireAdmin()

    const category = await db.createCategory({
      name: data.name,
      slug: data.slug,
      description: data.description,
      position: data.position,
      active: data.active,
      hero_image: data.hero_image,
    })

    revalidatePath('/admin/categorias')
    return { success: true as const, category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false as const, error: 'Error inesperado al crear la categoría' }
  }
}

export async function updateCategory(data: UpdateCategoryData) {
  try {
    await requireAdmin()

    const category = await db.updateCategory(data.id, {
      name: data.name,
      slug: data.slug,
      description: data.description,
      position: data.position,
      active: data.active,
      hero_image: data.hero_image,
    })

    revalidatePath('/admin/categorias')
    revalidatePath(`/admin/categorias/${data.id}`)
    return { success: true as const, category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false as const, error: 'Error inesperado al actualizar la categoría' }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await requireAdmin()

    const { count } = await db.getProducts({ categoryId })
    if (count > 0) {
      return {
        success: false as const,
        error: 'No se puede eliminar la categoría porque tiene productos asociados'
      }
    }

    await db.deleteCategory(categoryId)

    revalidatePath('/admin/categorias')
    return { success: true as const }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false as const, error: 'Error inesperado al eliminar la categoría' }
  }
}

export async function toggleCategoryStatus(categoryId: string) {
  try {
    await requireAdmin()

    const category = await db.getCategoryById(categoryId)
    if (!category) {
      return { success: false as const, error: 'Categoría no encontrada' }
    }

    await db.updateCategory(categoryId, { active: !category.active })

    revalidatePath('/admin/categorias')
    return { success: true as const }
  } catch (error) {
    console.error('Error toggling category status:', error)
    return { success: false as const, error: 'Error inesperado al cambiar el estado' }
  }
}

export async function getCategory(categoryId: string) {
  try {
    await requireAdmin()

    const category = await db.getCategoryById(categoryId)
    if (!category) {
      return { success: false as const, error: 'Error al cargar la categoría' }
    }

    return { success: true as const, category }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { success: false as const, error: 'Error inesperado al cargar la categoría' }
  }
}

export async function getAllCategories() {
  try {
    await requireAdmin()

    const categories = await db.getCategories()
    return { success: true as const, categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false as const, error: 'Error inesperado al cargar las categorías' }
  }
}
