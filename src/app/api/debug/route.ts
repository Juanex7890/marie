import { NextResponse } from 'next/server'

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  
  return NextResponse.json({
    env: {
      ADMIN_EMAIL: adminEmail ? `Set (${adminEmail})` : 'Not set',
      ADMIN_PASSWORD: adminPassword ? 'Set (hidden)' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    },
    nodeEnv: process.env.NODE_ENV,
    testCredentials: {
      email: 'juanestebanbecerra78@gmail.com',
      emailMatch: 'juanestebanbecerra78@gmail.com' === adminEmail,
      passwordLength: adminPassword ? adminPassword.length : 0
    }
  })
}
