import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    env: {
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? `Set (${process.env.ADMIN_EMAIL})` : 'Not set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set (hidden)' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    },
    nodeEnv: process.env.NODE_ENV
  })
}
