import { NextRequest, NextResponse } from 'next/server'

let cachedHost: string | null = null
let hostExpiry = 0

async function getAudiusHost(): Promise<string> {
  if (cachedHost && Date.now() < hostExpiry) return cachedHost
  try {
    const res = await fetch('https://api.audius.co', { next: { revalidate: 3600 } })
    const data: { data?: string[] } = await res.json()
    const hosts = data.data ?? []
    if (hosts.length > 0) {
      cachedHost = hosts[Math.floor(Math.random() * hosts.length)]
      hostExpiry = Date.now() + 60 * 60 * 1000
      return cachedHost
    }
  } catch {}
  cachedHost = 'https://discoveryprovider.audius.co'
  hostExpiry = Date.now() + 5 * 60 * 1000
  return cachedHost
}

interface AudiusArtwork { '150x150'?: string; '480x480'?: string; '1000x1000'?: string }
interface AudiusUser { name: string; handle: string }
interface AudiusTrack {
  id: string
  title: string
  duration: number
  user: AudiusUser
  artwork?: AudiusArtwork
  genre?: string
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ results: [] })
  }

  try {
    const host = await getAudiusHost()
    const url = `${host}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=A-LYRICS&limit=12`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'A+Lyrics/1.0', Accept: 'application/json' },
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`Audius API error: ${res.status}`)

    const data: { data?: AudiusTrack[] } = await res.json()
    const tracks = data.data ?? []

    const results = tracks
      .filter((t) => t.id && t.title)
      .map((t) => ({
        trackId: t.id,
        trackName: t.title,
        artistName: t.user?.name ?? t.user?.handle ?? 'Unknown',
        collectionName: '',
        previewUrl: `${host}/v1/tracks/${t.id}/stream?app_name=A-LYRICS`,
        artworkUrl100:
          t.artwork?.['150x150'] ??
          t.artwork?.['480x480'] ??
          t.artwork?.['1000x1000'] ??
          '',
        trackTimeMillis: (t.duration || 180) * 1000,
        primaryGenreName: t.genre ?? '',
        source: 'audius' as const,
      }))

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('Audius search error:', err)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 502 })
  }
}
