import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  verifyWebhookSignature,
  parseWebhookStatus,
  extractTxMeta,
  getPlanExpiry,
} from '@/lib/payment'
import type { WebhookPayload } from '@/lib/payment'
import type { PlanId } from '@/lib/plans'

export async function POST(request: NextRequest) {
  // ── Parse body ──────────────────────────────────────────────────────────────
  let payload: WebhookPayload
  try {
    payload = (await request.json()) as WebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Signature verification ──────────────────────────────────────────────────
  const signatureValid = verifyWebhookSignature(payload)
  if (!signatureValid) {
    console.warn('[Webhook] Invalid DusuPay signature — rejected')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const status = parseWebhookStatus(payload)
  const { txRef, planId, userId } = extractTxMeta(payload)

  if (!txRef) {
    console.error('[Webhook] Missing transaction_id in payload')
    return NextResponse.json({ received: true })
  }

  // ── Load payment record ─────────────────────────────────────────────────────
  const payment = await prisma.payment.findUnique({
    where:  { txRef },
    select: { id: true, status: true, userId: true, plan: true },
  })

  if (!payment) {
    console.error(`[Webhook] Payment not found for txRef: ${txRef}`)
    // Still return 200 so DusuPay does not retry forever
    return NextResponse.json({ received: true })
  }

  // ── Idempotency: skip if already finalized ──────────────────────────────────
  if (payment.status === 'SUCCESSFUL' || payment.status === 'FAILED') {
    return NextResponse.json({ received: true })
  }

  // ── Handle failed / cancelled ───────────────────────────────────────────────
  if (status === 'failed' || status === 'cancelled') {
    await prisma.payment.update({
      where: { txRef },
      data:  {
        status:      status === 'cancelled' ? 'CANCELLED' : 'FAILED',
        providerRef: payload.id,
        metadata:    payload as object,
      },
    }).catch(err => console.error('[Webhook] DB update error:', err))

    return NextResponse.json({ received: true })
  }

  // ── Handle completed ────────────────────────────────────────────────────────
  if (status === 'completed') {
    const finalPlanId = (payment.plan ?? planId) as PlanId
    const finalUserId = payment.userId ?? userId

    if (!finalUserId) {
      console.error(`[Webhook] Cannot resolve userId for txRef: ${txRef}`)
      return NextResponse.json({ received: true })
    }

    try {
      await prisma.$transaction([
        prisma.payment.update({
          where: { txRef },
          data:  {
            status:               'SUCCESSFUL',
            providerRef:          payload.id,
            providerTransactionId: payload.id,
            amount:               payload.account_amount,
            currency:             payload.account_currency,
            metadata:             payload as object,
          },
        }),
        prisma.user.update({
          where: { id: finalUserId },
          data:  { plan: finalPlanId, planExpiresAt: getPlanExpiry() },
        }),
      ])

      console.info(`[Webhook] ✓ Plan upgraded to ${finalPlanId} for user ${finalUserId}`)
    } catch (err) {
      console.error('[Webhook] Transaction error:', err)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
