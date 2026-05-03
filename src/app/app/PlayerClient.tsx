'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/ui/Header'
import Particles from '@/components/ui/Particles'
import CharacterStage from '@/components/stage/CharacterStage'
import SearchBar from '@/components/controls/SearchBar'
import PlayerControls from '@/components/controls/PlayerControls'
import UploadButton from '@/components/controls/UploadButton'
import RecordButton from '@/components/controls/RecordButton'
import SourceToggle from '@/components/controls/SourceToggle'
import UsageLimitModal from '@/components/shared/UsageLimitModal'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import { usePlayerStore } from '@/store/playerStore'

type Toast = 'success' | 'failed' | 'spotify_connected' | 'spotify_failed' | null

export default function PlayerClient() {
  const { data: session, update } = useSession()
  const audioEngine = useAudioEngine()
  const spotify = useSpotifyPlayer()
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  const status = usePlayerStore((s) => s.player.status)
  const isPlaying = status === 'playing'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const plan = params.get('plan')
    const sp = params.get('spotify')

    window.history.replaceState({}, '', '/app')

    if (payment === 'success') {
      setToast('success')
      if (plan) void update({ plan })
      setTimeout(() => setToast(null), 5000)
    } else if (payment === 'failed') {
      setToast('failed')
      setTimeout(() => setToast(null), 4000)
    } else if (sp === 'connected') {
      setToast('spotify_connected')
      setTimeout(() => setToast(null), 4000)
    } else if (sp === 'failed') {
      setToast('spotify_failed')
      setTimeout(() => setToast(null), 4000)
    }
  }, [update])

  const checkAndIncrementUsage = useCallback(async (): Promise<boolean> => {
    const res = await fetch('/api/user/usage', { method: 'POST' })
    if (res.status === 403) { setLimitModalOpen(true); return false }
    if (res.ok) {
      const data: { songsPlayedMonth: number } = await res.json()
      await update({ songsPlayedMonth: data.songsPlayedMonth })
    }
    return true
  }, [update])

  const toastConfig: Record<NonNullable<Toast>, { text: string; bg: string }> = {
    success: { text: '🎉 Payment successful! Plan upgraded!', bg: 'linear-gradient(135deg,#00F5A0,#059669)' },
    failed: { text: '❌ Payment failed. Please try again.', bg: 'linear-gradient(135deg,#EF4444,#DC2626)' },
    spotify_connected: { text: '♫ Spotify connected! Switch to Spotify in the search bar.', bg: 'linear-gradient(135deg,#1DB954,#15803d)' },
    spotify_failed: { text: '❌ Spotify connection failed. Please try again.', bg: 'linear-gradient(135deg,#EF4444,#DC2626)' },
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#0A0A1A' }}>
      <Particles />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-auto z-50 px-5 py-3 rounded-2xl font-bold text-white text-sm shadow-2xl text-center"
            style={{ background: toastConfig[toast].bg }}
          >
            {toastConfig[toast].text}
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* Source toggle row */}
      <div className="relative z-30 px-3 sm:px-4 pt-1 shrink-0">
        <div className="flex justify-end max-w-4xl mx-auto">
          <SourceToggle spotify={spotify} />
        </div>
      </div>

      {/* Search row */}
      <div className="relative z-30 px-3 sm:px-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex-1 min-w-0">
            <SearchBar audioEngine={audioEngine} spotify={spotify} onBeforePlay={checkAndIncrementUsage} />
          </div>
          <UploadButton audioEngine={audioEngine} onBeforePlay={checkAndIncrementUsage} />
          <RecordButton audioEngine={audioEngine} />
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0 px-3 sm:px-4 pb-2">
        <div className="relative h-full max-w-4xl mx-auto">
          {session && (
            <div className="absolute top-2 right-3 z-20 pointer-events-none">
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                {session.user.plan === 'FREE'
                  ? `${session.user.songsPlayedMonth}/10`
                  : `${session.user.plan}${isPlaying ? ' · 🔴' : ''}`}
              </span>
            </div>
          )}
          <CharacterStage />
        </div>
      </div>

      <div className="relative z-20 shrink-0">
        <PlayerControls audioEngine={audioEngine} spotify={spotify} />
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
