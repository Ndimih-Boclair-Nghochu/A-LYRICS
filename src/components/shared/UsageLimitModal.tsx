'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

interface Props {
  isOpen: boolean
  onClose: () => void
  plan: string
  songsPlayed: number
}

export default function UsageLimitModal({ isOpen, onClose, plan, songsPlayed }: Props) {
  const paidPlans = PLANS.filter((p) => p.id !== 'FREE')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg rounded-3xl p-7 border border-slate-700/50"
            style={{ background: 'rgba(18,18,42,0.98)', boxShadow: '0 0 80px rgba(155,93,229,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div className="text-5xl mb-3" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>🚀</motion.div>
              <h2 className="text-2xl font-black text-white mb-1">You've Hit Your Limit!</h2>
              <p className="text-slate-400 text-sm">
                You played <span className="text-neon-pink font-bold">{songsPlayed} song{songsPlayed !== 1 ? 's' : ''}</span> on the{' '}
                <span className="text-white font-semibold capitalize">{plan.toLowerCase()}</span> plan.
              </p>
              <p className="text-slate-500 text-sm mt-1">Upgrade to keep the music going! 🎵</p>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {paidPlans.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  href={`/pricing?plan=${p.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-700/40 hover:border-opacity-80 transition-all group"
                  style={{ background: `${p.color}10`, borderColor: `${p.color}30` }}
                  onClick={onClose}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{p.name}</span>
                      {p.popular && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${p.color}30`, color: p.color }}>Popular</span>}
                    </div>
                    <p className="text-slate-500 text-xs">{p.songsPerMonth ? `${p.songsPerMonth} songs/month` : 'Unlimited songs'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm" style={{ color: p.color }}>
                      ₦{p.priceNGN.toLocaleString()}
                    </p>
                    <p className="text-slate-600 text-xs">/month</p>
                  </div>
                  <span className="text-slate-600 group-hover:text-white transition-colors">→</span>
                </Link>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-slate-400 border border-slate-700/50 text-sm hover:border-slate-500 transition-all">
                Maybe later
              </button>
              <Link
                href="/pricing"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold text-center transition-all"
                style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow: '0 4px 16px rgba(155,93,229,0.35)' }}
              >
                View All Plans →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
