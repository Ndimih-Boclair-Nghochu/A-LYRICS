'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { getActiveLineIndex } from '@/utils/lyricsParser'
import { LYRIC_COLORS } from '@/utils/colorPalette'

export default function LyricsDisplay() {
  const lines = usePlayerStore((s) => s.lyrics.lines)
  const activeIndex = usePlayerStore((s) => s.lyrics.activeLineIndex)
  const setActiveLine = usePlayerStore((s) => s.setActiveLyricLine)
  const currentTime = usePlayerStore((s) => s.player.currentTime)
  const isLoading = usePlayerStore((s) => s.lyrics.isLoading)
  const currentTrack = usePlayerStore((s) => s.player.currentTrack)
  const status = usePlayerStore((s) => s.player.status)
  const beat = usePlayerStore((s) => s.beat)

  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Sync active line index with current time
  useEffect(() => {
    if (lines.length === 0) return
    const idx = getActiveLineIndex(lines, currentTime)
    if (idx !== activeIndex) setActiveLine(idx)
  }, [currentTime, lines, activeIndex, setActiveLine])

  // Scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIndex])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          className="text-5xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >🎵</motion.div>
        <p className="text-neon-cyan text-sm font-medium animate-pulse">Loading lyrics...</p>
      </div>
    )
  }

  if (!currentTrack && lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4 text-center">
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >🎤</motion.div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">No Song Playing</h3>
          <p className="text-slate-400 text-sm">Search for a song or upload your music<br />to see lyrics here</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {['🎵 Search songs', '📤 Upload music', '🎶 Dance time!'].map((t, i) => (
            <motion.span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-medium border border-slate-600 text-slate-400"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            >{t}</motion.span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Track info header */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 shrink-0"
        >
          <div className="relative shrink-0">
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            {status === 'playing' && (
              <div className="absolute inset-0 rounded-lg border-2 border-neon-pink animate-pulse-glow" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{currentTrack.title}</p>
            <p className="text-slate-400 text-xs truncate">{currentTrack.artist}</p>
          </div>
          {status === 'playing' && (
            <div className="ml-auto flex items-end gap-0.5 shrink-0 h-5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ background: LYRIC_COLORS[i * 2] }}
                  animate={{ height: ['6px', `${10 + (i % 3) * 6}px`, '4px'] }}
                  transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Lyrics scroll area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#9B5DE5 transparent' }}
      >
        <AnimatePresence>
          {lines.map((line, idx) => {
            const isActive = idx === activeIndex
            const isPast = idx < activeIndex
            const colorIdx = idx % LYRIC_COLORS.length
            const color = LYRIC_COLORS[colorIdx]

            return (
              <motion.div
                key={line.index}
                ref={isActive ? activeLineRef : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.015, duration: 0.3 }}
              >
                <motion.div
                  className={`relative px-4 py-2.5 rounded-xl cursor-default transition-all select-none ${
                    isActive ? 'rounded-2xl' : ''
                  }`}
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.02 + beat.bassEnergy * 0.02, 1],
                          x: beat.isBeat ? [0, 4, 0] : 0,
                        }
                      : { scale: 1, x: 0 }
                  }
                  transition={{ duration: 0.15 }}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(90deg, ${color}22, ${color}11)`,
                          borderLeft: `4px solid ${color}`,
                          boxShadow: `0 0 20px ${color}33, inset 0 0 20px ${color}11`,
                        }
                      : {
                          borderLeft: '4px solid transparent',
                          background: 'transparent',
                        }
                  }
                >
                  <p
                    className={`text-base font-medium leading-relaxed transition-all duration-300 ${
                      isActive
                        ? 'text-white text-lg font-bold'
                        : isPast
                        ? 'text-slate-600 text-sm'
                        : 'text-slate-400'
                    }`}
                    style={isActive ? { color, textShadow: `0 0 12px ${color}88` } : {}}
                  >
                    {line.text}
                  </p>

                  {/* Active line animated underline */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                      animate={{ scaleX: [0, 1] }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Padding at bottom */}
        <div className="h-24" />
      </div>
    </div>
  )
}
