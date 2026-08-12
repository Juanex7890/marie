import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    return NextResponse.json({
      provided: { email, password },
      expected: { 
        email: adminEmail, 
        password: adminPassword ? 'Set' : 'Not set' 
      },
      matches: {
        email: email === adminEmail,
        password: password === adminPassword
      },
      envVars: {
        ADMIN_EMAIL: adminEmail ? 'Set' : 'Not set',
        ADMIN_PASSWORD: adminPassword ? 'Set' : 'Not set'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
