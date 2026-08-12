import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import fs from 'node:fs'

type ServiceAccount = { project_id: string; client_email: string; private_key: string }

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (raw) return JSON.parse(raw) as ServiceAccount

  const credentialPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (credentialPath && fs.existsSync(credentialPath)) {
    return JSON.parse(fs.readFileSync(credentialPath, 'utf8')) as ServiceAccount
  }

  throw new Error('Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT in production.')
}

export function getFirebaseAdminApp(): App {
  const serviceAccount = getServiceAccount()
  return getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export const firebaseAuth = () => getAuth(getFirebaseAdminApp())
export const firestore = () => getFirestore(getFirebaseAdminApp())
export const firebaseStorage = () => getStorage(getFirebaseAdminApp())
