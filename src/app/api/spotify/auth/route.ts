import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getSpotifyClientId, getSpotifyRedirectUri, SPOTIFY_SCOPES } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = getSpotifyClientId()
  if (!clientId) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 500 })
  }

  const state = randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: getSpotifyRedirectUri(),
    state,
    show_dialog: 'false',
  })

  const res = NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
  res.cookies.set('sp_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
