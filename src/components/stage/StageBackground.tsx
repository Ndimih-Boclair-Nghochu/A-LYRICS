'use client'
import { motion } from 'framer-motion'
import type { BeatState } from '@/types/beat'

interface Props {
  beat: BeatState
  isPlaying: boolean
}

const SPOTLIGHTS = [
  { cx: '20%', color: '#FF6B9D' },
  { cx: '50%', color: '#9B5DE5' },
  { cx: '80%', color: '#00D2FF' },
]

export default function StageBackground({ beat, isPlaying }: Props) {
  const intensity = beat.bassEnergy

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Spotlights */}
      {SPOTLIGHTS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{
            left: s.cx,
            transform: 'translateX(-50%)',
            width: '200px',
            height: '90%',
            background: `conic-gradient(from 180deg at 50% 0%, transparent 70deg, ${s.color}22 90deg, transparent 110deg)`,
            transformOrigin: 'top center',
          }}
          animate={
            isPlaying
              ? {
                  opacity: [0.4 + intensity * 0.6, 0.6 + intensity * 0.4],
                  scaleX: [1, 1.05 + intensity * 0.1, 1],
                }
              : { opacity: 0.15 }
          }
          transition={{ duration: 0.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}

      {/* Star particles */}
      {isPlaying &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-sm select-none"
            style={{
              left: `${8 + (i * 7.5) % 85}%`,
              bottom: '15%',
              fontSize: `${8 + (i % 4) * 4}px`,
            }}
            animate={{
              y: [0, -(80 + (i % 3) * 60)],
              x: [0, (i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 8)],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.2, 0],
            }}
            transition={{
              duration: 1.8 + (i % 4) * 0.4,
              repeat: Infinity,
              delay: (i * 0.25) % 2,
              ease: 'easeOut',
            }}
          >
            {['⭐', '✦', '★', '✨', '💫', '🌟'][i % 6]}
          </motion.div>
        ))}

      {/* Beat flash overlay */}
      {beat.isBeat && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: 'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.12), transparent 70%)' }}
        />
      )}

      {/* Grid floor lines */}
      <svg
        className="absolute bottom-0 left-0 right-0"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        width="100%"
        height="120"
      >
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* Perspective grid lines horizontal */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
          const y = 120 * (t ** 0.6)
          const xPad = 200 * (1 - t) * 0.7
          return (
            <line key={`h${i}`} x1={xPad} y1={y} x2={400 - xPad} y2={y}
              stroke="#9B5DE5" strokeWidth="0.5" strokeOpacity={0.3 + t * 0.3} />
          )
        })}
        {/* Perspective grid lines vertical */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={200} y1={0} x2={(i + 1) * 40} y2={120}
            stroke="#00D2FF" strokeWidth="0.5" strokeOpacity="0.2" />
        ))}
      </svg>
    </div>
  )
}
