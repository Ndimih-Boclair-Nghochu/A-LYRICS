'use client'
import { Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

function PricingContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const highlight = searchParams.get('plan')

  const handleUpgrade = async (planId: PlanId) => {
    if (!session) { router.push('/auth/register'); return }
    if (planId === 'FREE') return
    setLoading(planId)
    setError('')

    const res = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })

    if (!res.ok) { setError('Failed to start payment. Try again.'); setLoading(null); return }
    const { link }: { link: string } = await res.json()
    window.location.href = link
  }

  const currentPlan = session?.user.plan ?? 'FREE'

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-white mb-4">
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg">
          Pay securely with card, mobile money, or bank transfer via Flutterwave
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mt-4 text-sm text-slate-500">
          <span>🇳🇬 NGN</span><span>🇬🇭 GHS</span><span>🇰🇪 KES</span><span>🇿🇦 ZAR</span><span>🇺🇬 UGX</span>
          <span className="text-slate-600">& more</span>
        </motion.div>
      </div>

      {error && (
        <div className="mb-8 text-center px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md mx-auto">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan, i) => {
          const isCurrent = currentPlan === plan.id
          const isHighlighted = highlight === plan.id

          return (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`relative rounded-3xl p-6 border transition-all flex flex-col ${isHighlighted ? 'scale-105' : ''}`}
              style={{
                background: plan.popular ? `linear-gradient(180deg, ${plan.color}18, rgba(18,18,42,0.9))` : 'rgba(18,18,42,0.8)',
                borderColor: isHighlighted || plan.popular ? plan.color : 'rgba(100,116,139,0.25)',
                boxShadow: plan.popular ? `0 0 40px ${plan.color}20` : 'none',
                backdropFilter: 'blur(16px)',
              }}>

              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white whitespace-nowrap"
                  style={{ background: plan.gradient }}>
                  ⭐ Most Popular
                </div>
              )}

              <div className="mb-5">
                <div className="text-3xl mb-2">{plan.emoji}</div>
                <h2 className="text-white font-black text-xl">{plan.name}</h2>
                <p className="text-slate-500 text-sm">{plan.tagline}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black" style={{ color: plan.priceNGN === 0 ? '#64748b' : plan.color }}>
                    {plan.priceNGN === 0 ? 'Free' : `₦${plan.priceNGN.toLocaleString()}`}
                  </span>
                  {plan.priceNGN > 0 && <span className="text-slate-500 text-sm mb-1">/month</span>}
                </div>
                {plan.priceUSD > 0 && (
                  <p className="text-slate-600 text-xs">≈ ${plan.priceUSD}/month</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm">
                    <span style={{ color: plan.color }}>✓</span>
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => void handleUpgrade(plan.id)}
                disabled={loading === plan.id || isCurrent}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                style={
                  isCurrent
                    ? { background: 'rgba(100,116,139,0.2)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' }
                    : plan.id === 'FREE'
                    ? { background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }
                    : { background: plan.gradient, color: 'white', boxShadow: `0 4px 16px ${plan.color}35` }
                }>
                {loading === plan.id ? '⟳ Loading...' : isCurrent ? '✓ Current Plan' : plan.id === 'FREE' ? 'Get Started Free' : `Upgrade to ${plan.name}`}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-white font-black text-2xl text-center mb-8">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: 'What payment methods are accepted?', a: 'We accept all major cards, mobile money (MTN, Airtel, etc.), bank transfer, and USSD — powered by Flutterwave for Africa-wide coverage.' },
            { q: 'Can I cancel anytime?', a: 'Yes! Plans are month-to-month. Cancel anytime and you\'ll keep access until your billing period ends.' },
            { q: 'Is the Free plan truly free?', a: 'Absolutely. The Free plan is free forever with 1 song per month and full access to all animated sticker features.' },
            { q: 'What currencies are supported?', a: 'NGN, GHS, KES, ZAR, UGX, TZS, XOF and many more African currencies via Flutterwave.' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-5 border border-slate-700/30" style={{ background: 'rgba(18,18,42,0.6)' }}>
              <p className="text-white font-bold text-sm mb-2">{item.q}</p>
              <p className="text-slate-400 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen" style={{ background: '#0A0A1A' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-white font-black text-xl"
            style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00D2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            A+ LYRICS
          </span>
        </Link>
        <div className="flex gap-3">
          {session ? (
            <Link href="/app" className="px-4 py-2 rounded-xl border border-slate-700 text-white text-sm hover:border-slate-500 transition-all">Back to App</Link>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm hover:border-slate-500 transition-all">Sign In</Link>
              <Link href="/auth/register" className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <Suspense fallback={<div className="flex items-center justify-center py-32 text-slate-500">Loading plans...</div>}>
        <PricingContent />
      </Suspense>
    </div>
  )
}
