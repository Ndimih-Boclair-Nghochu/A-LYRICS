'use client'
import { motion } from 'framer-motion'
import Header from '@/components/ui/Header'
import Particles from '@/components/ui/Particles'
import CharacterStage from '@/components/stage/CharacterStage'
import LyricsDisplay from '@/components/lyrics/LyricsDisplay'
import SearchBar from '@/components/controls/SearchBar'
import PlayerControls from '@/components/controls/PlayerControls'
import UploadButton from '@/components/controls/UploadButton'
import { useAudioEngine } from '@/hooks/useAudioEngine'

export default function Home() {
  const audioEngine = useAudioEngine()

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: '#0A0A1A' }}>
      {/* Ambient particles / background */}
      <Particles />

      {/* Header */}
      <Header />

      {/* Search + Upload bar */}
      <div className="relative z-10 px-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <SearchBar audioEngine={audioEngine} />
          </div>
          <UploadButton audioEngine={audioEngine} />
        </div>
      </div>

      {/* Main content: stage (left) + lyrics (right) */}
      <div className="relative z-10 flex flex-1 min-h-0 gap-3 px-4 pb-2">
        {/* Stage panel */}
        <motion.div
          className="hidden md:flex flex-col rounded-2xl overflow-hidden card-glow rainbow-border"
          style={{ flex: '0 0 45%', minWidth: 0 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="px-3 pt-3 pb-1 shrink-0 flex items-center gap-2"
            style={{ background: 'rgba(18,18,42,0.8)' }}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🎭 Stage</span>
          </div>
          <div className="flex-1 min-h-0">
            <CharacterStage />
          </div>
        </motion.div>

        {/* Lyrics panel */}
        <motion.div
          className="flex flex-col flex-1 min-w-0 rounded-2xl overflow-hidden card-glow"
          style={{ background: 'rgba(12,12,28,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(155,93,229,0.18)' }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="px-3 pt-3 pb-1 shrink-0 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🎤 Lyrics</span>
            <span className="text-xs text-slate-600">Powered by A+ LYRICS</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <LyricsDisplay />
          </div>
        </motion.div>
      </div>

      {/* Mobile: stage below lyrics */}
      <div className="md:hidden relative z-10 px-4 pb-2 shrink-0" style={{ height: '220px' }}>
        <div className="h-full rounded-2xl overflow-hidden card-glow rainbow-border">
          <CharacterStage />
        </div>
      </div>

      {/* Player controls (pinned bottom) */}
      <div className="relative z-20 shrink-0">
        <PlayerControls audioEngine={audioEngine} />
      </div>
    </div>
  )
}
