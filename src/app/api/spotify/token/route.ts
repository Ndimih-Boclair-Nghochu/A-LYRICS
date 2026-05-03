import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { refreshAccessToken, COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_EXPIRES } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const store = cookies()
  const access = store.get(COOKIE_ACCESS)?.value
  const expires = Number(store.get(COOKIE_EXPIRES)?.value ?? 0)
  const refresh = store.get(COOKIE_REFRESH)?.value

  if (access && Date.now() < expires - 30_000) {
    return NextResponse.json({ accessToken: access, expiresAt: expires })
  }

  if (!refresh) {
    return NextResponse.json({ error: 'not_connected' }, { status: 401 })
  }

  try {
    const tokens = await refreshAccessToken(refresh)
    const expiresAt = Date.now() + tokens.expires_in * 1000

    const res = NextResponse.json({ accessToken: tokens.access_token, expiresAt })
    const isProd = process.env.NODE_ENV === 'production'

    res.cookies.set(COOKIE_ACCESS, tokens.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    })
    res.cookies.set(COOKIE_EXPIRES, String(expiresAt), {
      httpOnly: false,
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
    return res
  } catch {
    const res = NextResponse.json({ error: 'refresh_failed' }, { status: 401 })
    res.cookies.delete(COOKIE_ACCESS)
    res.cookies.delete(COOKIE_REFRESH)
    res.cookies.delete(COOKIE_EXPIRES)
    return res
  }
}
