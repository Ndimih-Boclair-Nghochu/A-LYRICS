import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { initiatePayment, generateTxRef, AFRICAN_PAYMENT_CONFIGS, convertUSD } from '@/lib/payment'
import { getPlan } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'
import { z } from 'zod'

const schema = z.object({
  planId:      z.enum(['GROOVE', 'STAR', 'VIP']),
  phoneNumber: z.string().min(7).max(20),
  providerId:  z.string().min(3).max(30),  // e.g. "mtn_cm"
  currency:    z.string().length(3),        // ISO 4217
})

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Validate body ───────────────────────────────────────────────────────────
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { planId, phoneNumber, providerId, currency } = parsed.data

  // ── Validate plan & amount server-side (never trust frontend) ───────────────
  const plan = getPlan(planId as PlanId)
  if (plan.priceUSD <= 0) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Validate currency is supported in AFRICAN_PAYMENT_CONFIGS
  const supportedCurrencies = Object.values(AFRICAN_PAYMENT_CONFIGS).map(c => c.currency)
  if (!supportedCurrencies.includes(currency)) {
    return NextResponse.json({ error: 'Currency not supported' }, { status: 400 })
  }

  // ── Fetch user ──────────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // ── Check for duplicate in-progress payment (idempotency) ──────────────────
  const existing = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      plan:   planId as PlanId,
      status: 'PENDING',
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // within 15 min
    },
  })
  if (existing) {
    return NextResponse.json({
      txRef:        existing.txRef,
      status:       'pending',
      instructions: [{ step_no: 1, description: 'A payment is already in progress. Check your phone for a PIN prompt.' }],
    })
  }

  // ── Generate our unique reference ───────────────────────────────────────────
  const txRef = generateTxRef(user.id, planId)
  const localAmount = convertUSD(plan.priceUSD, currency)

  // ── Pre-create pending payment record ───────────────────────────────────────
  await prisma.payment.create({
    data: {
      userId:      user.id,
      amount:      localAmount,
      currency,
      plan:        planId as PlanId,
      status:      'PENDING',
      provider:    'dusupay',
      txRef,
      phoneNumber,
      network:     providerId,
    },
  })

  // ── Call DusuPay ─────────────────────────────────────────────────────────────
  const result = await initiatePayment({
    userId:      user.id,
    userEmail:   user.email,
    userName:    user.name ?? 'A+ LYRICS User',
    planId:      planId as PlanId,
    priceUSD:    plan.priceUSD,
    currency,
    phoneNumber,
    providerId,
    txRef,
  })

  // ── Store provider transaction ID if returned ────────────────────────────────
  if (result.providerTransactionId) {
    await prisma.payment.update({
      where: { txRef },
      data: {
        providerTransactionId: result.providerTransactionId,
        metadata: result.rawResponse as object,
      },
    })
  }

  if (!result.success) {
    // Mark failed in DB
    await prisma.payment.update({
      where: { txRef },
      data: { status: 'FAILED' },
    })
    return NextResponse.json({ error: result.error ?? 'Payment initiation failed' }, { status: 502 })
  }

  return NextResponse.json({
    txRef,
    providerTransactionId: result.providerTransactionId,
    status:       result.status,
    instructions: result.instructions ?? [],
    checkoutUrl:  result.checkoutUrl,
    amount:       localAmount,
    currency,
    planName:     plan.name,
  })
}
