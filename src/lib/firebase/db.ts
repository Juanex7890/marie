import { FieldPath } from 'firebase-admin/firestore'
import { firestore } from './admin'

export interface Category {
  id: string; name: string; slug: string; description?: string; hero_image?: string
  position: number; active: boolean; created_at: string; updated_at: string
}
export interface ProductImage {
  id: string; product_id: string; file_path: string; position: number; created_at: string
}
export interface Product {
  id: string; name: string; slug: string; description: string; price: number
  compare_at_price?: number | null; active: boolean; best_seller: boolean; category_id: string
  created_at: string; updated_at: string; images: ProductImage[]; categories?: Category | null
}

const data = <T>(snapshot: FirebaseFirestore.DocumentSnapshot) => ({ id: snapshot.id, ...snapshot.data() } as T)

export async function getCategories(activeOnly = false): Promise<Category[]> {
  const snapshot = await firestore().collection('categories').get()
  return snapshot.docs.map(doc => data<Category>(doc)).filter(c => !activeOnly || c.active).sort((a, b) => a.position - b.position)
}

export async function getCategoryById(id: string) { const doc = await firestore().collection('categories').doc(id).get(); return doc.exists ? data<Category>(doc) : null }

const normalizeSlug = (value: string) => value.normalize('NFC').trim().toLowerCase()

export async function getCategoryBySlug(slug: string, activeOnly = false) {
  const target = normalizeSlug(slug)
  const categories = await getCategories(activeOnly)
  return categories.find(c => normalizeSlug(c.slug) === target) ?? null
}

async function imagesFor(productIds: string[]) {
  const result = new Map<string, ProductImage[]>()
  await Promise.all(productIds.map(async productId => {
    const snapshot = await firestore().collection('product_images').where('product_id', '==', productId).get()
    result.set(productId, snapshot.docs.map(doc => data<ProductImage>(doc)).sort((a, b) => a.position - b.position))
  }))
  return result
}

export async function enrichProducts(products: Product[], withCategory = true): Promise<Product[]> {
  const [images, categories] = await Promise.all([imagesFor(products.map(p => p.id)), withCategory ? getCategories() : Promise.resolve([])])
  const categoryMap = new Map(categories.map(category => [category.id, category]))
  return products.map(product => ({ ...product, images: images.get(product.id) ?? [], ...(withCategory ? { categories: categoryMap.get(product.category_id) ?? null } : {}) }))
}

export type ProductFilters = { activeOnly?: boolean; categoryId?: string; bestSeller?: boolean; search?: string; sort?: 'latest' | 'price_asc' | 'price_desc'; offset?: number; limit?: number }
export async function getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; count: number }> {
  const snapshot = await firestore().collection('products').get()
  let products = snapshot.docs.map(doc => data<Product>(doc)).filter(p => {
    if (filters.activeOnly && !p.active) return false
    if (filters.categoryId && p.category_id !== filters.categoryId) return false
    if (filters.bestSeller && !p.best_seller) return false
    if (filters.search) { const q = filters.search.toLowerCase(); return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) }
    return true
  })
  products.sort((a, b) => filters.sort === 'price_asc' ? a.price - b.price : filters.sort === 'price_desc' ? b.price - a.price : b.created_at.localeCompare(a.created_at))
  const count = products.length
  products = products.slice(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? products.length))
  return { products: await enrichProducts(products), count }
}

export async function getProductById(id: string) { const doc = await firestore().collection('products').doc(id).get(); return doc.exists ? (await enrichProducts([data<Product>(doc)]))[0] : null }
export async function getProductBySlug(slug: string, activeOnly = false) {
  const snapshot = await firestore().collection('products').where('slug', '==', slug).limit(1).get()
  const product = snapshot.empty ? null : data<Product>(snapshot.docs[0])
  return product && (!activeOnly || product.active) ? (await enrichProducts([product]))[0] : null
}

export async function createCategory(input: Omit<Category, 'id' | 'created_at' | 'updated_at'>) { const now = new Date().toISOString(); const ref = firestore().collection('categories').doc(); const category = { ...input, id: ref.id, created_at: now, updated_at: now }; await ref.set(category); return category }
export async function updateCategory(id: string, input: Partial<Category>) { await firestore().collection('categories').doc(id).update({ ...input, updated_at: new Date().toISOString() }); return getCategoryById(id) }
export async function deleteCategory(id: string) { await firestore().collection('categories').doc(id).delete() }
export async function createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'images' | 'categories'>) { const now = new Date().toISOString(); const ref = firestore().collection('products').doc(); const product = { ...input, id: ref.id, created_at: now, updated_at: now }; await ref.set(product); return product }
export async function updateProduct(id: string, input: Partial<Product>) { await firestore().collection('products').doc(id).update({ ...input, updated_at: new Date().toISOString() }); return getProductById(id) }
export async function deleteProduct(id: string) { const batch = firestore().batch(); batch.delete(firestore().collection('products').doc(id)); const images = await firestore().collection('product_images').where('product_id', '==', id).get(); images.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit() }
export async function getImages(productId: string) { return (await imagesFor([productId])).get(productId) ?? [] }
export async function addImage(input: Omit<ProductImage, 'id' | 'created_at'>) { const now = new Date().toISOString(); const ref = firestore().collection('product_images').doc(); const image = { ...input, id: ref.id, created_at: now }; await ref.set(image); return image }
export async function getImage(id: string) { const doc = await firestore().collection('product_images').doc(id).get(); return doc.exists ? data<ProductImage>(doc) : null }
export async function deleteImage(id: string) { await firestore().collection('product_images').doc(id).delete() }
