import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canPlaySong } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, songsPlayedMonth: true, monthlyResetAt: true, planExpiresAt: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Auto-reset monthly count
  const now = new Date()
  const reset = new Date(user.monthlyResetAt)
  if (now.getFullYear() > reset.getFullYear() || now.getMonth() > reset.getMonth()) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { songsPlayedMonth: 0, monthlyResetAt: now },
    })
    user.songsPlayedMonth = 0
  }

  // Auto-downgrade if plan expired
  if (user.plan !== 'FREE' && user.planExpiresAt && user.planExpiresAt < now) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: 'FREE' },
    })
    user.plan = 'FREE' as typeof user.plan
  }

  const planId = user.plan as PlanId
  const allowed = canPlaySong(planId, user.songsPlayedMonth)

  return NextResponse.json({
    plan: planId,
    songsPlayedMonth: user.songsPlayedMonth,
    canPlay: allowed,
    planExpiresAt: user.planExpiresAt,
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, songsPlayedMonth: true, monthlyResetAt: true, planExpiresAt: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const planId = user.plan as PlanId
  if (!canPlaySong(planId, user.songsPlayedMonth)) {
    return NextResponse.json({ error: 'Limit reached', canPlay: false }, { status: 403 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { songsPlayedMonth: { increment: 1 } },
    select: { songsPlayedMonth: true },
  })

  return NextResponse.json({ canPlay: true, songsPlayedMonth: updated.songsPlayedMonth })
}
