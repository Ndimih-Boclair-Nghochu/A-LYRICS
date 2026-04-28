import crypto from 'crypto'
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyPaymentResult,
  WebhookPayload,
  PaymentStatus,
} from './types'
import { convertUSD } from './types'
import { getPlan } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

// ─── Config (all from env — no hardcoded secrets) ─────────────────────────────

function cfg() {
  return {
    apiKey:      process.env.DUSUPAY_API_KEY      ?? '',
    merchantId:  process.env.DUSUPAY_MERCHANT_ID  ?? '',
    secretKey:   process.env.DUSUPAY_SECRET_KEY   ?? '',
    baseUrl:     process.env.DUSUPAY_BASE_URL      ?? 'https://sandbox.dusupay.com/v1',
    callbackUrl: process.env.DUSUPAY_CALLBACK_URL ?? '',
    returnUrl:   process.env.DUSUPAY_RETURN_URL   ?? '',
  }
}

// ─── HMAC signature verification ─────────────────────────────────────────────
// DusuPay webhook HMAC = SHA256 of concatenated fields using API key as secret

export function verifyWebhookSignature(payload: WebhookPayload): boolean {
  const { apiKey, secretKey } = cfg()
  const secret = secretKey || apiKey
  if (!secret) return false

  const {
    id, status, request_amount, request_currency,
    account_amount, account_currency, transaction_id,
    provider_id, hmac,
  } = payload

  const raw = [
    id, status, request_amount, request_currency,
    account_amount, account_currency, transaction_id,
    provider_id,
  ].join('')

  const computed = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac ?? ''))
}

// ─── Initiate payment ─────────────────────────────────────────────────────────

export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const { apiKey, baseUrl, callbackUrl, returnUrl } = cfg()

  if (!apiKey) {
    return { success: false, status: 'failed', error: 'Payment service not configured' }
  }

  const localAmount = convertUSD(input.priceUSD, input.currency)

  const body = {
    amount:                   localAmount,
    currency:                 input.currency,
    method:                   'MOBILE_MONEY',
    provider_id:              input.providerId,
    merchant_transaction_id:  input.txRef,
    narration:                `A+ LYRICS — ${getPlan(input.planId).name} Plan`,
    redirect_url:             returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/app`,
    callback_url:             callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook/dusupay`,
    account_number:           input.phoneNumber,
    account_name:             input.userName || 'A+ LYRICS User',
    customer_email:           input.userEmail,
  }

  let raw: unknown
  try {
    const res = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers: {
        'api-key':     apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    raw = await res.json()

    if (!res.ok) {
      const msg = (raw as { message?: string }).message ?? `HTTP ${res.status}`
      console.error('[DusuPay] initiate error:', msg)
      return { success: false, status: 'failed', error: msg, rawResponse: raw }
    }
  } catch (err) {
    console.error('[DusuPay] network error:', err)
    return { success: false, status: 'failed', error: 'Payment service unavailable' }
  }

  const data = raw as {
    code?: number
    status?: string
    message?: string
    data?: {
      id?: string
      status?: string
      instructions?: { step_no: number; description: string }[]
      checkout_url?: string
    }
  }

  const inner = data.data
  if (!inner) {
    return { success: false, status: 'failed', error: data.message ?? 'Invalid response', rawResponse: raw }
  }

  const statusMap: Record<string, PaymentStatus> = {
    pending:   'pending',
    processing: 'pending',
    completed: 'completed',
    failed:    'failed',
    cancelled: 'cancelled',
  }

  return {
    success: true,
    providerTransactionId: inner.id,
    status: statusMap[inner.status ?? 'pending'] ?? 'pending',
    instructions: inner.instructions,
    checkoutUrl:  inner.checkout_url,
    rawResponse:  raw,
  }
}

// ─── Verify / poll payment status ────────────────────────────────────────────

export async function verifyPayment(
  internalReference: string,
  txRef: string
): Promise<VerifyPaymentResult> {
  const { apiKey, baseUrl } = cfg()

  if (!apiKey) {
    return { success: false, status: 'failed', error: 'Payment service not configured' }
  }

  let raw: unknown
  try {
    const res = await fetch(`${baseUrl}/collections/${encodeURIComponent(internalReference)}`, {
      headers: { 'api-key': apiKey },
    })
    raw = await res.json()

    if (!res.ok) {
      return {
        success: false,
        status: 'failed',
        error: (raw as { message?: string }).message ?? `HTTP ${res.status}`,
        rawResponse: raw,
      }
    }
  } catch (err) {
    console.error('[DusuPay] verify error:', err)
    return { success: false, status: 'failed', error: 'Verification service unavailable' }
  }

  const data = raw as {
    data?: {
      id?: string
      status?: string
      request_amount?: number
      request_currency?: string
      transaction_id?: string
    }
  }

  const inner = data.data
  if (!inner) {
    return { success: false, status: 'failed', error: 'Empty response', rawResponse: raw }
  }

  const statusMap: Record<string, PaymentStatus> = {
    pending:    'pending',
    processing: 'pending',
    completed:  'completed',
    failed:     'failed',
    cancelled:  'cancelled',
  }
  const status = statusMap[inner.status ?? 'failed'] ?? 'failed'

  // Extract planId + userId from txRef: ALYRICS-{PLANID}-{USERID}-{TS}
  let planId: PlanId | undefined
  let userId: string | undefined
  const parts = txRef.split('-')
  if (parts.length >= 4) {
    planId = parts[1] as PlanId
    userId = parts[2]
  }

  return {
    success: status === 'completed',
    status,
    planId,
    userId,
    txRef,
    providerTransactionId: inner.id,
    amount:   inner.request_amount,
    currency: inner.request_currency,
    rawResponse: raw,
  }
}

// ─── Parse webhook payload ────────────────────────────────────────────────────

export function parseWebhookStatus(payload: WebhookPayload): PaymentStatus {
  const map: Record<string, PaymentStatus> = {
    completed:  'completed',
    successful: 'completed',
    failed:     'failed',
    cancelled:  'cancelled',
    pending:    'pending',
  }
  return map[payload.status?.toLowerCase()] ?? 'failed'
}

export function extractTxMeta(payload: WebhookPayload): {
  txRef: string
  planId: PlanId | undefined
  userId: string | undefined
} {
  const txRef = payload.transaction_id ?? ''
  const parts = txRef.split('-')
  const planId = parts.length >= 4 ? (parts[1] as PlanId) : undefined
  const userId = parts.length >= 4 ? parts[2] : undefined
  return { txRef, planId, userId }
}

// ─── Reference generator ─────────────────────────────────────────────────────

export function generateTxRef(userId: string, planId: string): string {
  return `ALYRICS-${planId}-${userId}-${Date.now()}`
}

// ─── Plan expiry helper ───────────────────────────────────────────────────────

export function getPlanExpiry(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d
}
