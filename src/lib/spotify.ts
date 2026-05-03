import { cookies } from 'next/headers'

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ')

export const COOKIE_ACCESS = 'sp_access'
export const COOKIE_REFRESH = 'sp_refresh'
export const COOKIE_EXPIRES = 'sp_expires'

export function getSpotifyClientId(): string {
  return process.env.SPOTIFY_CLIENT_ID ?? ''
}

export function getSpotifyClientSecret(): string {
  return process.env.SPOTIFY_CLIENT_SECRET ?? ''
}

export function getSpotifyRedirectUri(): string {
  const base =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/spotify/callback`
}

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${getSpotifyClientId()}:${getSpotifyClientSecret()}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getSpotifyRedirectUri(),
    }),
  })
  if (!res.ok) throw new Error(`Spotify token exchange failed: ${res.status}`)
  return res.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${getSpotifyClientId()}:${getSpotifyClientSecret()}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`Spotify refresh failed: ${res.status}`)
  return res.json()
}

export async function getValidAccessToken(): Promise<string | null> {
  const store = cookies()
  const access = store.get(COOKIE_ACCESS)?.value
  const expires = Number(store.get(COOKIE_EXPIRES)?.value ?? 0)
  const refresh = store.get(COOKIE_REFRESH)?.value

  if (access && Date.now() < expires - 30_000) return access
  if (!refresh) return null

  try {
    const t = await refreshAccessToken(refresh)
    return t.access_token
  } catch {
    return null
  }
}
