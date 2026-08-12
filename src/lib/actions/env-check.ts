'use server'

export async function checkEnvironment() {
  const envVars = {
    JWT_SECRET: !!process.env.JWT_SECRET,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_SERVICE_ACCOUNT: !!(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  }

  const missing = Object.entries(envVars)
    .filter(([_, exists]) => !exists)
    .map(([key]) => key)

  return {
    success: missing.length === 0,
    envVars,
    missing,
    message: missing.length === 0 
      ? 'All environment variables are set' 
      : `Missing environment variables: ${missing.join(', ')}`
  }
}
