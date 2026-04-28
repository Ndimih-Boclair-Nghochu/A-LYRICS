import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get('artist')
  const title = request.nextUrl.searchParams.get('title')

  if (!artist || !title) {
    return NextResponse.json({ error: 'artist and title required' }, { status: 400 })
  }

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'A+Lyrics/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ lyrics: null }, { status: 404 })
    }

    const data: { lyrics?: string } = await res.json()

    return NextResponse.json(
      { lyrics: data.lyrics ?? null },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (err) {
    console.error('Lyrics error:', err)
    return NextResponse.json({ lyrics: null }, { status: 502 })
  }
}
