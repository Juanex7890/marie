import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/firebase/db'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const { products } = await getProducts({
    activeOnly: true,
    search: query,
    sort: 'latest',
    limit: 6,
  })

  return NextResponse.json({ results: products })
}
