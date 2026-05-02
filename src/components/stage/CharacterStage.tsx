'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Singer from '@/components/characters/Singer'
import DancerA from '@/components/characters/DancerA'
import DancerB from '@/components/characters/DancerB'
import { usePlayerStore } from '@/store/playerStore'
import StageBackground from './StageBackground'
import { LYRIC_COLORS } from '@/utils/colorPalette'
import { getActiveLineIndex } from '@/utils/lyricsParser'
import { useEffect } from 'react'

const LINE_ANIMATIONS = [
  { initial: { x: -60, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  { initial: { x: 60, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  { initial: { scale: 0.6, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
  { initial: { rotate: -8, opacity: 0, y: 20 }, animate: { rotate: 0, opacity: 1, y: 0 } },
  { initial: { rotate: 8, opacity: 0, y: 20 }, animate: { rotate: 0, opacity: 1, y: 0 } },
]

export default function CharacterStage() {
  const beat = usePlayerStore((s) => s.beat)
  const status = usePlayerStore((s) => s.player.status)
  const lines = usePlayerStore((s) => s.lyrics.lines)
  const activeIndex = usePlayerStore((s) => s.lyrics.activeLineIndex)
  const currentTime = usePlayerStore((s) => s.player.currentTime)
  const setActiveLine = usePlayerStore((s) => s.setActiveLyricLine)
  const isPlaying = status === 'playing'

  useEffect(() => {
    if (lines.length === 0) return
    const idx = getActiveLineIndex(lines, currentTime)
    if (idx !== activeIndex) setActiveLine(idx)
  }, [currentTime, lines, activeIndex, setActiveLine])

  const prev = activeIndex > 0 ? lines[activeIndex - 1] : null
  const current = lines[activeIndex] ?? null
  const next = lines[activeIndex + 1] ?? null

  const activeColor = LYRIC_COLORS[activeIndex % LYRIC_COLORS.length]

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(180deg, #04041A 0%, #0D0522 40%, #140820 70%, #0A0A1A 100%)' }}
    >
      <StageBackground beat={beat} isPlaying={isPlaying} />

      {/* ── LYRICS OVERLAY (upper portion) ── */}
      <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center justify-center px-4 pt-4"
        style={{ height: '50%', pointerEvents: 'none' }}
      >
        {lines.length === 0 ? (
          <motion.div className="text-center"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <div className="text-4xl mb-2">🎤</div>
            <p className="text-slate-400 text-sm font-medium">Search a song or upload your music to see lyrics</p>
          </motion.div>
        ) : (
          <div className="w-full max-w-2xl space-y-2">
            <AnimatePresence mode="popLayout">
              {prev && (
                <motion.p
                  key={`prev-${activeIndex}`}
                  {...LINE_ANIMATIONS[activeIndex % LINE_ANIMATIONS.length]}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="text-center font-medium truncate px-2"
                  style={{ color: 'rgba(255,255,255,0.28)', fontSize: 'clamp(0.75rem,2vw,1rem)' }}
                >{prev.text}</motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {current && (
                <motion.div
                  key={`cur-${activeIndex}`}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl blur-md"
                    style={{ background: `${activeColor}33` }}
                    animate={isPlaying ? { opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.p
                    className="relative text-center font-black px-3 py-2"
                    style={{
                      color: activeColor,
                      textShadow: `0 0 24px ${activeColor}aa, 0 2px 8px rgba(0,0,0,0.8)`,
                      fontSize: 'clamp(1.1rem,3.6vw,1.7rem)',
                    }}
                    animate={isPlaying && beat.isBeat
                      ? { scale: [1, 1.04 + beat.bassEnergy * 0.04, 1], x: [0, 3, -3, 0] }
                      : {}}
                    transition={{ duration: 0.2 }}
                  >{current.text}</motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {next && (
                <motion.p
                  key={`next-${activeIndex}`}
                  {...LINE_ANIMATIONS[(activeIndex + 1) % LINE_ANIMATIONS.length]}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-center font-medium truncate px-2"
                  style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(0.8rem,2.2vw,1.1rem)' }}
                >{next.text}</motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── CHARACTERS (bottom area) ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center gap-1 sm:gap-2 pb-8 px-2"
        style={{ height: '62%' }}
      >
        <motion.div className="flex-1 flex justify-center"
          animate={isPlaying ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <DancerA beat={beat} isPlaying={isPlaying} />
        </motion.div>

        <motion.div className="flex-1 flex justify-center"
          style={{ transform: 'scale(1.05)' }}
          animate={isPlaying ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Singer beat={beat} isPlaying={isPlaying} />
        </motion.div>

        <motion.div className="flex-1 flex justify-center"
          animate={isPlaying ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <DancerB beat={beat} isPlaying={isPlaying} />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${
            isPlaying
              ? `rgba(155,93,229,${0.15 + beat.bassEnergy * 0.5}), rgba(0,210,255,${0.1 + beat.bassEnergy * 0.3}), transparent`
              : 'rgba(155,93,229,0.08), transparent'
          })`,
          transition: 'background 0.1s',
        }}
      />

      <div className="absolute bottom-16 left-4 right-4 h-0.5 z-10 rounded-full overflow-hidden pointer-events-none">
        <motion.div className="h-full w-full"
          style={{
            background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00D2FF,#00F5A0,#FFD700,#FF6B9D)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0%','100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
