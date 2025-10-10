import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
  })
}

export async function verifyAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { email: string; role: string }
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const session = await verifyAdminSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }
  return session
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}
