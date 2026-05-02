import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingClient from './LandingClient'

export default async function HomePage() {
  let session = null
  try { session = await getServerSession(authOptions) } catch {}
  if (session) redirect('/app')
  return <LandingClient />
}
