'use client'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { usePlayerStore } from '@/store/playerStore'
import UserMenu from '@/components/shared/UserMenu'

export default function Header() {
  const isPlaying = usePlayerStore((s) => s.player.status === 'playing')
  const beat = usePlayerStore((s) => s.beat)
  const { data: session } = useSession()

  return (
    <header className="relative flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          className="relative flex items-center justify-center w-11 h-11 rounded-xl text-xl font-black"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #9B5DE5, #00D2FF)' }}
          animate={isPlaying ? { rotate: [0, 360] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <span className="relative z-10">🎵</span>
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: [`0 0 10px rgba(155,93,229,0.5)`, `0 0 ${20 + beat.bassEnergy * 20}px rgba(0,210,255,0.8)`, `0 0 10px rgba(155,93,229,0.5)`] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div>
          <motion.h1
            className="text-lg sm:text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #FF6B9D, #FFD700, #00F5A0, #00D2FF, #9B5DE5, #FF6B9D)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            A+ LYRICS
          </motion.h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase font-medium -mt-0.5">
            Where Music Comes Alive
          </p>
        </div>
      </div>

      {/* Right side: live indicator + user menu */}
      <div className="flex items-center gap-4">
        {session?.user && (
          <UserMenu user={{
            name: session.user.name,
            email: session.user.email!,
            image: session.user.image,
            plan: session.user.plan ?? 'FREE',
            songsPlayedMonth: session.user.songsPlayedMonth ?? 0,
          }} />
        )}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-pink/30"
            style={{ background: 'rgba(255,107,157,0.1)' }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-neon-pink"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-neon-pink text-xs font-bold uppercase tracking-wider">Live</span>
          </motion.div>
        )}

        {/* Beat BPM display */}
        {isPlaying && beat.bpm > 60 && (
          <motion.div
            className="text-xs font-mono text-slate-500"
            animate={beat.isBeat ? { color: '#9B5DE5', scale: 1.1 } : { color: '#64748b', scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {beat.bpm} BPM
          </motion.div>
        )}
      </div>
    </header>
  )
}
