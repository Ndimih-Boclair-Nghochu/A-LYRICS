import { NextResponse } from 'next/server'
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_EXPIRES } from '@/lib/spotify'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_ACCESS)
  res.cookies.delete(COOKIE_REFRESH)
  res.cookies.delete(COOKIE_EXPIRES)
  return res
}
