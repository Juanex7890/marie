import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development or with a secret key
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_SECRET !== 'debug123') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  return NextResponse.json({
    env: {
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'Set' : 'Not set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    },
    nodeEnv: process.env.NODE_ENV
  })
}
