import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to test authentication',
    example: {
      method: 'POST',
      body: {
        email: 'juanestebanbecerra78@gmail.com',
        password: 'your_password'
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    // Detailed comparison
    const emailMatch = email === adminEmail
    const passwordMatch = password === adminPassword
    
    return NextResponse.json({
      success: emailMatch && passwordMatch,
      details: {
        provided: { 
          email, 
          passwordLength: password?.length || 0 
        },
        expected: { 
          email: adminEmail, 
          passwordLength: adminPassword?.length || 0 
        },
        comparison: {
          emailMatch,
          passwordMatch,
          emailExact: `"${email}" === "${adminEmail}"`,
          passwordExact: password === adminPassword
        },
        environment: {
          ADMIN_EMAIL: adminEmail ? 'Set' : 'Not set',
          ADMIN_PASSWORD: adminPassword ? 'Set' : 'Not set'
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid request',
      details: error 
    }, { status: 400 })
  }
}
