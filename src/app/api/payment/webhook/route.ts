import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlanExpiry } from '@/lib/flutterwave'
import type { PlanId } from '@/lib/plans'

const FLW_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH ?? ''

export async function POST(request: NextRequest) {
  const hash = request.headers.get('verif-hash')
  if (!FLW_SECRET_HASH || hash !== FLW_SECRET_HASH) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: {
    event: string
    data: {
      status: string
      tx_ref: string
      flw_ref: string
      amount: number
      currency: string
      meta?: { userId?: string; planId?: string }
    }
  } = await request.json()

  if (payload.event !== 'charge.completed') {
    return NextResponse.json({ received: true })
  }

  const { status, tx_ref, flw_ref, amount, currency, meta } = payload.data

  if (status !== 'successful') {
    await prisma.payment.update({
      where: { txRef: tx_ref },
      data: { status: 'FAILED' },
    }).catch(() => {})
    return NextResponse.json({ received: true })
  }

  const planId = meta?.planId as PlanId | undefined
  const userId = meta?.userId

  if (!planId || !userId) {
    return NextResponse.json({ received: true })
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { txRef: tx_ref },
      data: { status: 'SUCCESSFUL', flutterwaveRef: flw_ref, amount, currency },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan: planId, planExpiresAt: getPlanExpiry() },
    }),
  ]).catch((e) => console.error('Webhook DB error:', e))

  return NextResponse.json({ received: true })
}
