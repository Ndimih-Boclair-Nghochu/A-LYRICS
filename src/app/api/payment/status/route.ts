import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Poll payment status from frontend — only exposes status, never secrets
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const txRef = request.nextUrl.searchParams.get('ref')
  if (!txRef) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({
    where:  { txRef },
    select: { status: true, userId: true, plan: true, currency: true, amount: true },
  })

  if (!payment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only the owning user can poll their payment
  if (payment.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    status:   payment.status.toLowerCase(),
    plan:     payment.plan,
    currency: payment.currency,
    amount:   payment.amount,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
