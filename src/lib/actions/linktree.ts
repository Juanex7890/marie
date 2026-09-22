'use server'

import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getLinktreeConfigForAdmin() {
  try {
    await requireAdmin()

    const config = await db.getLinktreeConfig()
    return { success: true as const, config }
  } catch (error) {
    console.error('Error fetching linktree config:', error)
    return { success: false as const, error: 'Error inesperado al cargar la configuración' }
  }
}

export async function saveLinktreeConfig(config: Omit<db.LinktreeConfig, 'updated_at'>) {
  try {
    await requireAdmin()

    if (!config.displayName.trim()) {
      return { success: false as const, error: 'El nombre a mostrar es obligatorio' }
    }

    const saved = await db.saveLinktreeConfig({
      ...config,
      links: config.links.map((link, index) => ({ ...link, position: index })),
    })

    revalidatePath('/admin/linktree')
    revalidatePath('/linktree')
    return { success: true as const, config: saved }
  } catch (error) {
    console.error('Error saving linktree config:', error)
    return { success: false as const, error: 'Error inesperado al guardar la configuración' }
  }
}
