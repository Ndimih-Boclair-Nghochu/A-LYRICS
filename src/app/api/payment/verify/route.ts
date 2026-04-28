import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyTransaction, getPlanExpiry } from '@/lib/flutterwave'

// Flutterwave redirects here after payment
export async function GET(request: NextRequest) {
  const txRef = request.nextUrl.searchParams.get('tx_ref')
  const transactionId = request.nextUrl.searchParams.get('transaction_id')
  const status = request.nextUrl.searchParams.get('status')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (status !== 'successful' || !transactionId || !txRef) {
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed`)
  }

  // Check if already processed
  const existing = await prisma.payment.findUnique({
    where: { txRef },
    select: { status: true, userId: true },
  })

  if (existing?.status === 'SUCCESSFUL') {
    return NextResponse.redirect(`${appUrl}/app?payment=already_done`)
  }

  const result = await verifyTransaction(transactionId)

  if (!result.success || !result.planId || !result.userId) {
    await prisma.payment.update({
      where: { txRef },
      data: { status: 'FAILED' },
    }).catch(() => {})
    return NextResponse.redirect(`${appUrl}/pricing?payment=failed`)
  }

  // Update payment + user plan
  await prisma.$transaction([
    prisma.payment.update({
      where: { txRef },
      data: {
        status: 'SUCCESSFUL',
        flutterwaveRef: result.flutterwaveRef,
        amount: result.amount ?? 0,
        currency: result.currency ?? 'NGN',
      },
    }),
    prisma.user.update({
      where: { id: result.userId },
      data: {
        plan: result.planId,
        planExpiresAt: getPlanExpiry(),
      },
    }),
  ])

  return NextResponse.redirect(`${appUrl}/app?payment=success&plan=${result.planId}`)
}
