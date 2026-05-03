import { NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

interface SpotifyImage { url: string; width?: number; height?: number }
interface SpotifyArtist { name: string }
interface SpotifyAlbum { name: string; images: SpotifyImage[] }
interface SpotifyTrack {
  id: string
  uri: string
  name: string
  duration_ms: number
  preview_url: string | null
  artists: SpotifyArtist[]
  album: SpotifyAlbum
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return NextResponse.json({ results: [] })

  const token = await getValidAccessToken()
  if (!token) {
    return NextResponse.json({ error: 'not_connected', results: [] }, { status: 401 })
  }

  try {
    const url = `https://api.spotify.com/v1/search?type=track&limit=12&q=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'spotify_search_failed', results: [] }, { status: res.status })
    }
    const data: { tracks?: { items: SpotifyTrack[] } } = await res.json()
    const items = data.tracks?.items ?? []

    const results = items.map((t) => {
      const artwork = t.album.images.find((i) => (i.width ?? 0) <= 300) ?? t.album.images[0]
      return {
        trackId: t.id,
        trackName: t.name,
        artistName: t.artists.map((a) => a.name).join(', '),
        collectionName: t.album.name,
        previewUrl: t.preview_url ?? '',
        artworkUrl100: artwork?.url ?? '',
        trackTimeMillis: t.duration_ms,
        primaryGenreName: '',
        source: 'spotify' as const,
        spotifyUri: t.uri,
      }
    })

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Spotify search error:', err)
    return NextResponse.json({ error: 'spotify_search_failed', results: [] }, { status: 502 })
  }
}
