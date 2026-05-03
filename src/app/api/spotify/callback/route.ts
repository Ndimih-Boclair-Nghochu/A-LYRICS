import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_EXPIRES } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const cookieState = request.cookies.get('sp_state')?.value
  const baseUrl = `${url.protocol}//${url.host}`

  if (error || !code || !state || state !== cookieState) {
    return NextResponse.redirect(`${baseUrl}/app?spotify=failed`)
  }

  try {
    const tokens = await exchangeCodeForToken(code)
    const expiresAt = Date.now() + tokens.expires_in * 1000

    const res = NextResponse.redirect(`${baseUrl}/app?spotify=connected`)
    const isProd = process.env.NODE_ENV === 'production'

    res.cookies.set(COOKIE_ACCESS, tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    })
    if (tokens.refresh_token) {
      res.cookies.set(COOKIE_REFRESH, tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
    res.cookies.set(COOKIE_EXPIRES, String(expiresAt), {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    })
    res.cookies.delete('sp_state')
    return res
  } catch (err) {
    console.error('Spotify callback error:', err)
    return NextResponse.redirect(`${baseUrl}/app?spotify=failed`)
  }
}
