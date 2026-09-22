#!/usr/bin/env node
// Migrates product images still served from i.postimg.cc into Cloudinary,
// updating each product_images.file_path to the new Cloudinary secure_url.
//
// Why: i.postimg.cc images are served unresized (often 600x601 for a
// 172x229 thumbnail) with no automatic format negotiation, which is the
// single biggest chunk of Lighthouse's image-weight finding. Cloudinary is
// already used elsewhere in this project and getImageUrl() in src/lib/utils.ts
// already applies f_auto,q_auto,c_limit,w_<N> to any res.cloudinary.com URL,
// so once file_path points there, every existing page gets the optimization
// for free — no other code changes needed.
//
// Usage:
//   node scripts/migrate-postimg-to-cloudinary.mjs            # dry run (default)
//   node scripts/migrate-postimg-to-cloudinary.mjs --apply    # actually migrate
//
// Requires in .env.local: FIREBASE_SERVICE_ACCOUNT(_PATH), CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { v2 as cloudinary } from 'cloudinary'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const APPLY = process.argv.includes('--apply')

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

async function migrateOne(db, doc) {
  const { id, file_path, product_id } = doc

  const response = await fetch(file_path)
  if (!response.ok) {
    throw new Error(`Download failed (HTTP ${response.status})`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'cojines-marie', resource_type: 'image' }, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
      .end(buffer)
  })

  await db.collection('product_images').doc(id).update({ file_path: uploadResult.secure_url })

  return { id, product_id, from: file_path, to: uploadResult.secure_url }
}

async function main() {
  loadDotEnvLocal()

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local')
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  const app = getApps()[0] ?? initializeApp({ credential: cert(getServiceAccount()) })
  const db = getFirestore(app)
  db.settings({ ignoreUndefinedProperties: true })

  const snapshot = await db.collection('product_images').get()
  const targets = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((img) => typeof img.file_path === 'string' && img.file_path.includes('i.postimg.cc'))

  console.log(`Found ${snapshot.size} product_images total, ${targets.length} still on i.postimg.cc.`)

  if (targets.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  if (!APPLY) {
    console.log('\nDry run (no changes made). Sample of images that would be migrated:')
    for (const t of targets.slice(0, 20)) {
      console.log(`  [${t.product_id}] ${t.file_path}`)
    }
    if (targets.length > 20) console.log(`  ... and ${targets.length - 20} more`)
    console.log('\nRun again with --apply to actually upload to Cloudinary and update Firestore.')
    return
  }

  console.log('\nApplying migration (this uploads real files to your Cloudinary account and writes to Firestore)...')
  let done = 0
  let failed = 0
  for (const target of targets) {
    try {
      const result = await migrateOne(db, target)
      done++
      console.log(`  [${done}/${targets.length}] OK  product ${result.product_id} -> ${result.to}`)
    } catch (error) {
      failed++
      console.error(`  [FAILED] product ${target.product_id}, image ${target.id}: ${error.message}`)
    }
  }

  console.log(`\nDone. Migrated: ${done}. Failed: ${failed}.`)
  if (failed > 0) {
    console.log('Re-run the script — it only targets remaining i.postimg.cc URLs, so it is safe to retry.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
