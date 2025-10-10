'use server'

import { adminLoginSchema, AdminLoginData } from '@/lib/validators'
import { createAdminSession } from '@/lib/auth'

export async function loginAdmin(data: AdminLoginData) {
  try {
    const validatedData = adminLoginSchema.parse(data)
    
    const { email, password } = validatedData
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return {
        success: false,
        error: 'Configuración de administrador no encontrada'
      }
    }

    if (email === adminEmail && password === adminPassword) {
      await createAdminSession(email)
      return { success: true }
    } else {
      return {
        success: false,
        error: 'Credenciales inválidas'
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Error al procesar la solicitud'
    }
  }
}

export async function logoutAdmin() {
  const { clearAdminSession } = await import('@/lib/auth')
  await clearAdminSession()
}
