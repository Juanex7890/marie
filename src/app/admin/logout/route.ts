import { logoutAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

export async function POST() {
  await logoutAdmin()
  redirect('/admin/login')
}
