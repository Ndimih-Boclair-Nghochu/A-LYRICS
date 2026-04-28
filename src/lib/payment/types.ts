import type { PlanId } from '@/lib/plans'

// ─── Provider types ───────────────────────────────────────────────────────────

export type PaymentProvider = 'dusupay'
export type PaymentMethod = 'MOBILE_MONEY'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

// ─── Country → currency + providers map ──────────────────────────────────────

export interface ProviderOption {
  id: string       // e.g. "mtn_cm"
  name: string     // e.g. "MTN Mobile Money"
  flag: string
}

export interface CountryPaymentConfig {
  currency: string
  currencySymbol: string
  phonePrefix: string
  providers: ProviderOption[]
}

export const AFRICAN_PAYMENT_CONFIGS: Record<string, CountryPaymentConfig> = {
  CM: {
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+237',
    providers: [
      { id: 'mtn_cm',    name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'orange_cm', name: 'Orange Money',     flag: '🟠' },
    ],
  },
  KE: {
    currency: 'KES',
    currencySymbol: 'KSh',
    phonePrefix: '+254',
    providers: [
      { id: 'mpesa_ke', name: 'M-Pesa', flag: '🟢' },
    ],
  },
  UG: {
    currency: 'UGX',
    currencySymbol: 'USh',
    phonePrefix: '+256',
    providers: [
      { id: 'mtn_ug',   name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'airtel_ug', name: 'Airtel Money',     flag: '🔴' },
    ],
  },
  GH: {
    currency: 'GHS',
    currencySymbol: 'GH₵',
    phonePrefix: '+233',
    providers: [
      { id: 'mtn_gh',       name: 'MTN Mobile Money',  flag: '🟡' },
      { id: 'vodafone_gh',  name: 'Vodafone Cash',      flag: '🔴' },
      { id: 'airteltigo_gh', name: 'AirtelTigo Money',  flag: '🔵' },
    ],
  },
  TZ: {
    currency: 'TZS',
    currencySymbol: 'TSh',
    phonePrefix: '+255',
    providers: [
      { id: 'mpesa_tz',  name: 'M-Pesa',       flag: '🟢' },
      { id: 'airtel_tz', name: 'Airtel Money',  flag: '🔴' },
      { id: 'tigo_tz',   name: 'Tigo Pesa',    flag: '🔵' },
    ],
  },
  RW: {
    currency: 'RWF',
    currencySymbol: 'FRw',
    phonePrefix: '+250',
    providers: [
      { id: 'mtn_rw',   name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'airtel_rw', name: 'Airtel Money',     flag: '🔴' },
    ],
  },
  ZM: {
    currency: 'ZMW',
    currencySymbol: 'ZK',
    phonePrefix: '+260',
    providers: [
      { id: 'mtn_zm',   name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'airtel_zm', name: 'Airtel Money',     flag: '🔴' },
    ],
  },
  NG: {
    currency: 'NGN',
    currencySymbol: '₦',
    phonePrefix: '+234',
    providers: [
      { id: 'mtn_ng',    name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'airtel_ng', name: 'Airtel Money',      flag: '🔴' },
    ],
  },
  SN: {
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+221',
    providers: [
      { id: 'orange_sn', name: 'Orange Money', flag: '🟠' },
      { id: 'wave_sn',   name: 'Wave',         flag: '🔵' },
    ],
  },
  CI: {
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+225',
    providers: [
      { id: 'mtn_ci',    name: 'MTN Mobile Money', flag: '🟡' },
      { id: 'orange_ci', name: 'Orange Money',      flag: '🟠' },
    ],
  },
}

// USD → local currency fixed reference rates (update periodically)
export const USD_RATES: Record<string, number> = {
  XAF: 620,
  KES: 130,
  UGX: 3750,
  GHS: 15,
  TZS: 2650,
  RWF: 1350,
  ZMW: 26,
  NGN: 1600,
  XOF: 620,
}

export function convertUSD(usdAmount: number, currency: string): number {
  const rate = USD_RATES[currency] ?? 1
  return Math.round(usdAmount * rate)
}

export function getCountryCode(countryName: string): string | null {
  const map: Record<string, string> = {
    'Cameroon': 'CM', 'Kenya': 'KE', 'Uganda': 'UG', 'Ghana': 'GH',
    'Tanzania': 'TZ', 'Rwanda': 'RW', 'Zambia': 'ZM', 'Nigeria': 'NG',
    'Senegal': 'SN', "Côte d'Ivoire": 'CI', 'Ethiopia': 'ET',
    'South Africa': 'ZA', 'Zimbabwe': 'ZW', 'Mozambique': 'MZ',
    'Mali': 'ML',
  }
  return map[countryName] ?? null
}

// ─── Initiate payment ─────────────────────────────────────────────────────────

export interface InitiatePaymentInput {
  userId: string
  userEmail: string
  userName: string
  planId: PlanId
  priceUSD: number
  currency: string
  phoneNumber: string
  providerId: string   // e.g. "mtn_cm"
  txRef: string        // our unique reference
}

export interface PaymentInstruction {
  step_no: number
  description: string
}

export interface InitiatePaymentResult {
  success: boolean
  providerTransactionId?: string
  status: PaymentStatus
  instructions?: PaymentInstruction[]
  checkoutUrl?: string
  error?: string
  rawResponse?: unknown
}

// ─── Verify payment ───────────────────────────────────────────────────────────

export interface VerifyPaymentResult {
  success: boolean
  status: PaymentStatus
  planId?: PlanId
  userId?: string
  txRef?: string
  providerTransactionId?: string
  amount?: number
  currency?: string
  error?: string
  rawResponse?: unknown
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export interface WebhookPayload {
  id: string
  status: string
  request_amount: number
  request_currency: string
  account_amount: number
  account_currency: string
  transaction_id: string   // our txRef
  provider_id: string
  customer_email?: string
  hmac: string
  [key: string]: unknown
}
