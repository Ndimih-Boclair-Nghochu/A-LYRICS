import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: ReactNode }) {
  let session = null
  try { session = await getServerSession(authOptions) } catch {}
  if (!session) redirect('/auth/login')
  return <>{children}</>
}
