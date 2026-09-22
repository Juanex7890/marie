import type { Metadata } from 'next'
import { getLinktreeConfig } from '@/lib/firebase/db'
import { LinktreeView } from '@/components/linktree/LinktreeView'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getLinktreeConfig()
  return {
    title: config.displayName,
    description: config.bio || undefined,
  }
}

export default async function LinksPage() {
  const config = await getLinktreeConfig()

  return <LinktreeView config={config} className="min-h-screen" />
}
