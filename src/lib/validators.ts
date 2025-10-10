import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  slug: z.string().min(1, 'El slug es requerido').max(100),
  description: z.string().optional(),
  hero_image: z.string().optional(),
  position: z.number().int().min(0),
})

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  slug: z.string().min(1, 'El slug es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  compare_at_price: z.number().positive().optional().nullable(),
  active: z.boolean(),
  category_id: z.string().uuid('ID de categoría inválido'),
})

export const productImageSchema = z.object({
  product_id: z.string().uuid(),
  file_path: z.string().min(1),
  position: z.number().int().min(0),
})

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['latest', 'price_asc', 'price_desc']).default('latest'),
  page: z.number().int().positive().default(1),
})

export const adminLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ProductImageFormData = z.infer<typeof productImageSchema>
export type SearchParams = z.infer<typeof searchSchema>
export type AdminLoginData = z.infer<typeof adminLoginSchema>
