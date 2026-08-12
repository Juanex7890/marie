#!/usr/bin/env node
// One-off import: reads the Supabase pg_dump backup and writes categories,
// products, and product_images into Firestore via firebase-admin.
// Usage: node scripts/import-backup.mjs [path-to-backup-file]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

function loadDotEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (raw) return JSON.parse(raw)

  const credentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (credentialPath && fs.existsSync(credentialPath)) {
    return JSON.parse(fs.readFileSync(credentialPath, 'utf8'))
  }

  throw new Error(
    'Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env.local.'
  )
}

function unescapeCopyValue(raw) {
  if (raw === '\\N') return null
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch !== '\\') {
      out += ch
      continue
    }
    const next = raw[i + 1]
    switch (next) {
      case 't': out += '\t'; i++; break
      case 'n': out += '\n'; i++; break
      case 'r': out += '\r'; i++; break
      case '\\': out += '\\'; i++; break
      default: out += next ?? ''; i++
    }
  }
  return out
}

function parseCopyBlock(dumpText, tableName) {
  const startMarker = `COPY ${tableName} `
  const startIdx = dumpText.indexOf(startMarker)
  if (startIdx === -1) return { columns: [], rows: [] }

  const headerEnd = dumpText.indexOf('FROM stdin;\n', startIdx)
  const columnsRaw = dumpText.slice(startIdx + startMarker.length, headerEnd).trim()
  const columns = columnsRaw
    .slice(1, -1) // strip surrounding parens
    .split(',')
    .map((c) => c.trim().replace(/^"|"$/g, ''))

  const bodyStart = headerEnd + 'FROM stdin;\n'.length
  const bodyEnd = dumpText.indexOf('\n\\.', bodyStart)
  const body = dumpText.slice(bodyStart, bodyEnd)

  const rows = body
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('\t').map(unescapeCopyValue))

  return { columns, rows }
}

function rowsToObjects(columns, rows) {
  return rows.map((values) => {
    const obj = {}
    columns.forEach((col, i) => { obj[col] = values[i] })
    return obj
  })
}

async function main() {
  loadDotEnvLocal()

  const positional = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  const backupPath = positional
    ? path.resolve(positional)
    : path.join(repoRoot, 'db_cluster-28-11-2025@09-04-38.backup')

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }

  const dumpText = fs.readFileSync(backupPath, 'utf8')

  const categories = rowsToObjects(...Object.values(parseCopyBlock(dumpText, 'public.categories')))
  const products = rowsToObjects(...Object.values(parseCopyBlock(dumpText, 'public.products')))
  const productImages = rowsToObjects(...Object.values(parseCopyBlock(dumpText, 'public.product_images')))

  console.log(`Parsed from backup: ${categories.length} categories, ${products.length} products, ${productImages.length} product_images`)

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ categories, products, productImages }, null, 2))
    return
  }

  const app = getApps()[0] ?? initializeApp({ credential: cert(getServiceAccount()) })
  const db = getFirestore(app)

  const batch = db.batch()

  for (const c of categories) {
    const ref = db.collection('categories').doc(c.id)
    batch.set(ref, {
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      hero_image: c.hero_image ?? null,
      position: Number(c.position),
      active: c.active === 't',
      created_at: c.created_at,
      updated_at: c.updated_at,
    })
  }

  for (const p of products) {
    const ref = db.collection('products').doc(p.id)
    batch.set(ref, {
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: Number(p.price),
      compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
      active: p.active === 't',
      best_seller: p.best_seller === 't',
      category_id: p.category_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })
  }

  for (const img of productImages) {
    const ref = db.collection('product_images').doc(img.id)
    batch.set(ref, {
      product_id: img.product_id,
      file_path: img.file_path,
      position: Number(img.position),
      created_at: img.created_at,
    })
  }

  await batch.commit()

  console.log('Import complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
