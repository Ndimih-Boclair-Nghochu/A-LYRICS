import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPayment, getPlanExpiry } from '@/lib/payment'
import type { PlanId } from '@/lib/plans'

// DusuPay redirects the user here after payment (return_url)
// Query params: ?ref=ALYRICS-PLANID-USERID-TS  (our txRef)
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const txRef  = request.nextUrl.searchParams.get('ref') ?? ''

  if (!txRef) {
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=missing_ref`)
  }

  // ── Load payment record ─────────────────────────────────────────────────────
  const payment = await prisma.payment.findUnique({
    where:  { txRef },
    select: { id: true, status: true, userId: true, plan: true, providerTransactionId: true },
  })

  if (!payment) {
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed&reason=not_found`)
  }

  // ── Idempotency: already processed ─────────────────────────────────────────
  if (payment.status === 'SUCCESSFUL') {
    return NextResponse.redirect(`${appUrl}/app?payment=success&plan=${payment.plan}`)
  }

  if (!payment.providerTransactionId) {
    return NextResponse.redirect(`${appUrl}/app?payment=pending`)
  }

  // ── Verify with DusuPay ─────────────────────────────────────────────────────
  const result = await verifyPayment(payment.providerTransactionId, txRef)

  if (!result.success || result.status !== 'completed') {
    await prisma.payment.update({
      where: { txRef },
      data:  { status: result.status === 'cancelled' ? 'CANCELLED' : 'FAILED' },
    }).catch(() => {})
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed`)
  }

  // ── Atomically mark payment success + upgrade user plan ────────────────────
  const planId = payment.plan as PlanId
  await prisma.$transaction([
    prisma.payment.update({
      where: { txRef },
      data:  {
        status:      'SUCCESSFUL',
        providerRef: result.providerTransactionId,
        metadata:    result.rawResponse as object,
      },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data:  { plan: planId, planExpiresAt: getPlanExpiry() },
    }),
  ])

  return NextResponse.redirect(`${appUrl}/app?payment=success&plan=${planId}`)
}
