import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createPaymentLink } from '@/lib/flutterwave'
import type { PlanId } from '@/lib/plans'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId }: { planId: PlanId } = await request.json()

  if (!planId || planId === 'FREE') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { link, txRef } = await createPaymentLink(
    user.id,
    user.email,
    user.name ?? 'A+ LYRICS User',
    planId
  )

  // Pre-create a pending payment record
  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: 0,
      currency: 'NGN',
      plan: planId,
      status: 'PENDING',
      txRef,
    },
  })

  return NextResponse.json({ link, txRef })
}
