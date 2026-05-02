'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AFRICAN_PAYMENT_CONFIGS, getCountryCode } from '@/lib/payment/types'
import type { PlanConfig } from '@/lib/plans'

interface Props {
  plan: PlanConfig
  userCountry: string | null | undefined
  onClose: () => void
  onSuccess: (planId: string) => void
}

type Step = 'form' | 'pending' | 'success' | 'failed'

// Country name → 2-letter code
const countryConfig = (country: string | null | undefined) => {
  const code = getCountryCode(country ?? '')
  return code ? AFRICAN_PAYMENT_CONFIGS[code] ?? null : null
}

export default function PaymentModal({ plan, userCountry, onClose, onSuccess }: Props) {
  const [step, setStep]           = useState<Step>('form')
  const [phone, setPhone]         = useState('')
  const [providerId, setProvider] = useState('')
  const [currency, setCurrency]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [txRef, setTxRef]         = useState('')
  const [instructions, setInstructions] = useState<{ step_no: number; description: string }[]>([])
  const [errorMsg, setErrorMsg]   = useState('')
  const [pollCount, setPollCount] = useState(0)

  const config = countryConfig(userCountry)
  const isAfrican = !!config

  // Pre-select first provider and currency when modal opens
  useEffect(() => {
    if (config) {
      setProvider(config.providers[0]?.id ?? '')
      setCurrency(config.currency)
    }
  }, [config])

  // Poll payment status every 4s while on pending step
  const poll = useCallback(async () => {
    if (!txRef) return
    try {
      const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(txRef)}`)
      if (!res.ok) return
      const data: { status: string; plan: string } = await res.json()
      if (data.status === 'successful') {
        setStep('success')
        onSuccess(data.plan)
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStep('failed')
      }
    } catch { /* network hiccup — retry next tick */ }
  }, [txRef, onSuccess])

  useEffect(() => {
    if (step !== 'pending' || !txRef) return
    const id = setInterval(() => {
      setPollCount(c => c + 1)
    }, 4000)
    return () => clearInterval(id)
  }, [step, txRef])

  useEffect(() => {
    if (step === 'pending' && txRef) void poll()
  }, [pollCount, step, txRef, poll])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !providerId || !currency) return
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, phoneNumber: phone.trim(), providerId, currency }),
      })

      const data: {
        txRef?: string
        instructions?: { step_no: number; description: string }[]
        error?: string | Record<string, string[]>
        checkoutUrl?: string
      } = await res.json()

      if (!res.ok) {
        const msg = typeof data.error === 'string'
          ? data.error
          : 'Payment initiation failed. Please try again.'
        setErrorMsg(msg)
        setLoading(false)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setTxRef(data.txRef ?? '')
      setInstructions(data.instructions ?? [])
      setStep('pending')
    } catch {
      setErrorMsg('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  const selectedProvider = config?.providers.find(p => p.id === providerId)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.87, y: 30, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{ scale: 0.87, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-md rounded-3xl border border-slate-700/50 overflow-y-auto"
        style={{ background: 'rgba(18,18,42,0.98)', boxShadow: '0 0 80px rgba(155,93,229,0.2)', maxHeight: '92dvh', padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">

          {/* ── Non-African / unsupported country ── */}
          {!isAfrican && (
            <motion.div key="intl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h2 className="text-xl font-black text-white mb-2">International Payment</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Mobile Money payments are currently supported for users in Cameroon, Kenya, Uganda, Ghana, Tanzania, Rwanda, Zambia, Nigeria, Senegal, and Côte d&apos;Ivoire.
              </p>
              <div className="rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 mb-5">
                <p className="text-amber-300 text-sm">
                  Card &amp; PayPal support is coming soon for international users.<br />
                  <span className="text-amber-400 font-semibold">Contact us</span> to arrange early access.
                </p>
              </div>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
                Close
              </button>
            </motion.div>
          )}

          {/* ── Payment form ── */}
          {isAfrican && step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{plan.emoji}</span>
                <div>
                  <h2 className="text-lg font-black text-white">Upgrade to {plan.name}</h2>
                  <p className="text-slate-400 text-sm">
                    {config.currencySymbol}&nbsp;
                    {Math.round(plan.priceUSD * (
                      { XAF: 620, KES: 130, UGX: 3750, GHS: 15, TZS: 2650, RWF: 1350, ZMW: 26, NGN: 1600, XOF: 620 }[currency] ?? 1
                    )).toLocaleString()}
                    &nbsp;/ month
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
                {/* Network selector */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Select Network
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {config.providers.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProvider(p.id)}
                        className="flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all"
                        style={providerId === p.id
                          ? { borderColor: plan.color, background: `${plan.color}18`, color: 'white' }
                          : { borderColor: 'rgba(100,116,139,0.3)', background: 'transparent', color: '#94a3b8' }}
                      >
                        <span className="text-lg">{p.flag}</span>
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Mobile Money Number
                  </label>
                  <div className="flex gap-2">
                    <div className="shrink-0 flex items-center px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-slate-400 text-sm font-mono">
                      {config.phonePrefix}
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="670000000"
                      required
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple text-sm"
                    />
                  </div>
                  <p className="text-slate-600 text-xs mt-1.5">
                    A PIN prompt will be sent to this number.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !providerId || !phone}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all"
                  style={{ background: plan.gradient, boxShadow: `0 4px 20px ${plan.color}40` }}
                >
                  {loading ? '⟳ Initiating payment...' : `Pay ${config.currencySymbol} — ${plan.name} Plan`}
                </motion.button>

                <button type="button" onClick={onClose}
                  className="w-full py-2 text-slate-500 text-xs hover:text-slate-400 transition-colors">
                  Cancel
                </button>
              </form>

              <p className="text-slate-700 text-xs text-center mt-4">
                Secured by DusuPay · No card needed · Mobile Money only
              </p>
            </motion.div>
          )}

          {/* ── Awaiting PIN ── */}
          {isAfrican && step === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >📲</motion.div>
              <h2 className="text-xl font-black text-white mb-2">Check Your Phone</h2>
              <p className="text-slate-400 text-sm mb-5">
                A payment request was sent to your <span className="text-white font-semibold">{selectedProvider?.name}</span> number.
                Enter your PIN to confirm.
              </p>

              {instructions.length > 0 && (
                <div className="text-left space-y-2 mb-5">
                  {instructions.map(inst => (
                    <div key={inst.step_no} className="flex gap-2 text-sm text-slate-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                        {inst.step_no}
                      </span>
                      <span>{inst.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-5">
                <motion.div className="w-2 h-2 rounded-full bg-neon-purple"
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 rounded-full bg-neon-purple"
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
                <motion.div className="w-2 h-2 rounded-full bg-neon-purple"
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }} />
                <span className="text-slate-500 text-xs ml-1">Waiting for confirmation…</span>
              </div>

              <button onClick={onClose}
                className="w-full py-2 text-slate-500 text-xs hover:text-slate-400 transition-colors">
                Close — I&apos;ll check back later
              </button>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div className="text-6xl mb-4"
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }}>🎉</motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your plan has been upgraded to <span className="font-bold" style={{ color: plan.color }}>{plan.name}</span>. Enjoy the music!
              </p>
              <button onClick={onClose}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#00F5A0,#059669)' }}>
                Start Listening 🎵
              </button>
            </motion.div>
          )}

          {/* ── Failed ── */}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-xl font-black text-white mb-2">Payment Failed</h2>
              <p className="text-slate-400 text-sm mb-5">
                The payment was not completed. Please check your balance and try again.
              </p>
              <button onClick={() => setStep('form')}
                className="w-full py-3 rounded-xl font-bold text-white text-sm mb-2"
                style={{ background: plan.gradient }}>
                Try Again
              </button>
              <button onClick={onClose}
                className="w-full py-2 text-slate-500 text-xs hover:text-slate-400 transition-colors">
                Cancel
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
