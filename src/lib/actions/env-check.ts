'use server'

export async function checkEnvironment() {
  const envVars = {
    JWT_SECRET: !!process.env.JWT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
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
