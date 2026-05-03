import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = await getValidAccessToken()
  if (!token) {
    return NextResponse.json({ connected: false }, { status: 401 })
  }

  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      return NextResponse.json({ connected: false }, { status: res.status })
    }
    const profile: { display_name?: string; product?: string; email?: string } = await res.json()
    return NextResponse.json({
      connected: true,
      premium: profile.product === 'premium',
      userName: profile.display_name ?? profile.email ?? 'Spotify User',
    })
  } catch {
    return NextResponse.json({ connected: false }, { status: 502 })
  }
}
