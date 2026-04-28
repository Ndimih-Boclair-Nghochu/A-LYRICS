'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/ui/Header'
import Particles from '@/components/ui/Particles'
import CharacterStage from '@/components/stage/CharacterStage'
import LyricsDisplay from '@/components/lyrics/LyricsDisplay'
import SearchBar from '@/components/controls/SearchBar'
import PlayerControls from '@/components/controls/PlayerControls'
import UploadButton from '@/components/controls/UploadButton'
import UsageLimitModal from '@/components/shared/UsageLimitModal'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { usePlayerStore } from '@/store/playerStore'

export default function PlayerPage() {
  const { data: session, update } = useSession()
  const audioEngine = useAudioEngine()
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [paymentToast, setPaymentToast] = useState<'success' | 'failed' | null>(null)

  const status = usePlayerStore((s) => s.player.status)
  const isPlaying = status === 'playing'

  // Check for payment redirect success/failure
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const plan = params.get('plan')
    if (payment === 'success') {
      setPaymentToast('success')
      if (plan) void update({ plan })
      window.history.replaceState({}, '', '/app')
      setTimeout(() => setPaymentToast(null), 5000)
    } else if (payment === 'failed') {
      setPaymentToast('failed')
      window.history.replaceState({}, '', '/app')
      setTimeout(() => setPaymentToast(null), 4000)
    }
  }, [update])

  // Called before playing a song to check quota
  const checkAndIncrementUsage = useCallback(async (): Promise<boolean> => {
    const res = await fetch('/api/user/usage', { method: 'POST' })
    if (res.status === 403) {
      setLimitModalOpen(true)
      return false
    }
    if (res.ok) {
      const data: { songsPlayedMonth: number } = await res.json()
      await update({ songsPlayedMonth: data.songsPlayedMonth })
    }
    return true
  }, [update])

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: '#0A0A1A' }}>
      <Particles />

      {/* Payment toast */}
      <AnimatePresence>
        {paymentToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-2xl"
            style={{ background: paymentToast === 'success' ? 'linear-gradient(135deg,#00F5A0,#059669)' : 'linear-gradient(135deg,#EF4444,#DC2626)' }}
          >
            {paymentToast === 'success' ? '🎉 Payment successful! Enjoy your upgraded plan!' : '❌ Payment failed. Please try again.'}
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <div className="relative z-10 px-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <SearchBar audioEngine={audioEngine} onBeforePlay={checkAndIncrementUsage} />
          </div>
          <UploadButton audioEngine={audioEngine} onBeforePlay={checkAndIncrementUsage} />
        </div>
      </div>

      <div className="relative z-10 flex flex-1 min-h-0 gap-3 px-4 pb-2">
        <motion.div
          className="hidden md:flex flex-col rounded-2xl overflow-hidden card-glow rainbow-border"
          style={{ flex: '0 0 45%', minWidth: 0 }}
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        >
          <div className="px-3 pt-3 pb-1 shrink-0 flex items-center gap-2" style={{ background: 'rgba(18,18,42,0.8)' }}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🎭 Stage</span>
          </div>
          <div className="flex-1 min-h-0"><CharacterStage /></div>
        </motion.div>

        <motion.div
          className="flex flex-col flex-1 min-w-0 rounded-2xl overflow-hidden card-glow"
          style={{ background: 'rgba(12,12,28,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(155,93,229,0.18)' }}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="px-3 pt-3 pb-1 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🎤 Lyrics</span>
            {session && (
              <span className="text-xs text-slate-600">
                {session.user.plan === 'FREE'
                  ? `${session.user.songsPlayedMonth}/1 free songs used`
                  : `${session.user.plan} Plan • ${isPlaying ? '🔴 Live' : ''}`}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden"><LyricsDisplay /></div>
        </motion.div>
      </div>

      <div className="md:hidden relative z-10 px-4 pb-2 shrink-0" style={{ height: '220px' }}>
        <div className="h-full rounded-2xl overflow-hidden card-glow rainbow-border"><CharacterStage /></div>
      </div>

      <div className="relative z-20 shrink-0">
        <PlayerControls audioEngine={audioEngine} />
      </div>

      <UsageLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        plan={session?.user.plan ?? 'FREE'}
        songsPlayed={session?.user.songsPlayedMonth ?? 0}
      />
    </div>
  )
}
