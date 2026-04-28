import type { PlanId } from './plans'
import { getPlan } from './plans'

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export function generateTxRef(userId: string, planId: string): string {
  return `ALYRICS-${planId}-${userId}-${Date.now()}`
}

export interface PaymentLink {
  link: string
  txRef: string
}

export async function createPaymentLink(
  userId: string,
  userEmail: string,
  userName: string,
  planId: PlanId
): Promise<PaymentLink> {
  const plan = getPlan(planId)
  const txRef = generateTxRef(userId, planId)

  const payload = {
    tx_ref: txRef,
    amount: plan.priceNGN,
    currency: 'NGN',
    redirect_url: `${APP_URL}/api/payment/verify?tx_ref=${txRef}`,
    meta: { userId, planId },
    customer: {
      email: userEmail,
      name: userName || 'A+ LYRICS User',
    },
    customizations: {
      title: 'A+ LYRICS Subscription',
      description: `${plan.name} Plan — ${plan.tagline}`,
      logo: `${APP_URL}/logo.png`,
    },
    payment_options: 'card,mobilemoneyghana,mobilemoneyrwanda,mobilemoneyuganda,mobilemoneyzambia,account,banktransfer,ussd,barter',
  }

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Flutterwave error: ${err}`)
  }

  const data: { status: string; data: { link: string } } = await res.json()

  if (data.status !== 'success') {
    throw new Error('Failed to create payment link')
  }

  return { link: data.data.link, txRef }
}

export interface VerifyResult {
  success: boolean
  planId?: PlanId
  userId?: string
  txRef?: string
  flutterwaveRef?: string
  amount?: number
  currency?: string
}

export async function verifyTransaction(transactionId: string): Promise<VerifyResult> {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
    }
  )

  if (!res.ok) return { success: false }

  const data: {
    status: string
    data: {
      status: string
      tx_ref: string
      flw_ref: string
      amount: number
      currency: string
      meta: { userId?: string; planId?: string }
    }
  } = await res.json()

  if (data.status !== 'success' || data.data.status !== 'successful') {
    return { success: false }
  }

  return {
    success: true,
    planId: data.data.meta?.planId as PlanId,
    userId: data.data.meta?.userId,
    txRef: data.data.tx_ref,
    flutterwaveRef: data.data.flw_ref,
    amount: data.data.amount,
    currency: data.data.currency,
  }
}

export function getPlanExpiry(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d
}
