'use server'

import { randomUUID } from 'crypto'
import { unstable_rethrow } from 'next/navigation'
import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    const parts: string[] = []
    if (typeof err.message === 'string') parts.push(err.message)
    if (typeof err.code === 'string') parts.push(`código ${err.code}`)
    if (typeof err.name === 'string' && err.name !== 'Error') parts.push(err.name)
    if (parts.length > 0) return parts.join(' — ')
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Error inesperado'
}

export async function getLinktreeConfigForAdmin() {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const config = await db.getLinktreeConfig()
    return { success: true as const, config }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[getLinktreeConfig ${refId}] Error fetching linktree config:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}

export async function saveLinktreeConfig(config: Omit<db.LinktreeConfig, 'updated_at'>) {
  const refId = randomUUID().slice(0, 8)

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
    unstable_rethrow(error)
    console.error(`[saveLinktreeConfig ${refId}] Error saving linktree config:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}
