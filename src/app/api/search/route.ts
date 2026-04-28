import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=10&entity=song`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'A+Lyrics/1.0' },
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`iTunes API error: ${res.status}`)

    const data = await res.json()

    const results = (data.results || []).filter(
      (r: { previewUrl?: string }) => r.previewUrl
    )

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 502 })
  }
}
