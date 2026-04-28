'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import type { CharacterBeatProps } from '@/types/beat'

export default function DancerB({ beat, isPlaying }: CharacterBeatProps) {
  const bodyControls = useAnimationControls()
  const armLControls = useAnimationControls()
  const armRControls = useAnimationControls()
  const capControls = useAnimationControls()
  const legControls = useAnimationControls()

  const swayDuration = beat.bpm > 0 ? 60 / beat.bpm : 0.5

  useEffect(() => {
    if (!isPlaying) {
      bodyControls.start({ y: 0, rotate: 0 })
      armLControls.start({ rotate: 0 })
      armRControls.start({ rotate: 0 })
      capControls.start({ y: 0 })
      legControls.start({ rotate: 0 })
      return
    }

    if (beat.isBeat) {
      void bodyControls.start({
        y: [-16, 0],
        rotate: [-10, 10, 0],
        transition: { duration: 0.25, ease: 'easeOut' },
      })
      void capControls.start({
        y: [-8, 0],
        transition: { duration: 0.2, ease: 'easeOut' },
      })
      void armLControls.start({
        rotate: [20, 0],
        transition: { duration: 0.2 },
      })
      void armRControls.start({
        rotate: [-30, 0],
        transition: { duration: 0.2 },
      })
      void legControls.start({
        rotate: [8, -8, 0],
        transition: { duration: 0.3 },
      })
    } else {
      void bodyControls.start({
        rotate: [0, -6, 0, 6, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity },
      })
      void armLControls.start({
        rotate: [0, 20, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity },
      })
      void armRControls.start({
        rotate: [0, -25, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity, delay: swayDuration / 2 },
      })
    }
  }, [beat.isBeat, isPlaying, swayDuration, bodyControls, armLControls, armRControls, capControls, legControls])

  const glowIntensity = Math.round(beat.bassEnergy * 14)

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.div animate={bodyControls} className="relative">
        <svg
          viewBox="0 0 140 295"
          xmlns="http://www.w3.org/2000/svg"
          width="110"
          height="225"
          style={{ filter: `drop-shadow(0 0 ${glowIntensity}px #00D2FF) drop-shadow(0 0 ${glowIntensity * 2}px #9B5DE5)` }}
        >
          <defs>
            <radialGradient id="dancerBHead" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#7FF0FF" />
              <stop offset="100%" stopColor="#0891B2" />
            </radialGradient>
            <radialGradient id="dancerBBody" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#FFA560" />
              <stop offset="100%" stopColor="#C2410C" />
            </radialGradient>
          </defs>

          {/* Cap brim */}
          <motion.g animate={capControls} style={{ transformOrigin: '70px 45px' }}>
            <ellipse cx="70" cy="60" rx="46" ry="12" fill="#1E1E2E" />
            {/* Cap top */}
            <path d="M28 60 Q28 22 70 22 Q112 22 112 60" fill="#2D2D3E" />
            {/* Cap button */}
            <circle cx="70" cy="24" r="5" fill="#FF6B9D" />
            {/* Cap stripe */}
            <path d="M28 50 Q70 42 112 50" stroke="#FF6B9D" strokeWidth="3" fill="none" />
            {/* Cap visor */}
            <path d="M24 62 Q70 70 116 62" fill="#111122" />
          </motion.g>

          {/* Head */}
          <circle cx="70" cy="88" r="40" fill="url(#dancerBHead)" />
          <circle cx="70" cy="88" r="40" fill="none" stroke="#0891B2" strokeWidth="2" />

          {/* Cool sunglasses */}
          <rect x="36" y="80" width="30" height="16" rx="5" fill="#1E1E2E" />
          <rect x="74" y="80" width="30" height="16" rx="5" fill="#1E1E2E" />
          {/* Glasses bridge */}
          <line x1="66" y1="88" x2="74" y2="88" stroke="#1E1E2E" strokeWidth="4" />
          {/* Glasses lens shine */}
          <line x1="40" y1="84" x2="48" y2="82" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="78" y1="84" x2="86" y2="82" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* Glasses arms */}
          <line x1="36" y1="88" x2="24" y2="85" stroke="#1E1E2E" strokeWidth="3" strokeLinecap="round" />
          <line x1="104" y1="88" x2="116" y2="85" stroke="#1E1E2E" strokeWidth="3" strokeLinecap="round" />

          {/* Smirk / cool mouth */}
          <path d="M54 108 Q70 118 82 112" stroke="#0C4A6E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M55 109 Q66 115 80 112" fill="#38BDF8" opacity="0.3" />

          {/* Neck */}
          <rect x="58" y="123" width="24" height="22" fill="#7FF0FF" />

          {/* Body / hoodie */}
          <path d="M16 144 L46 133 L70 140 L94 133 L124 144 L120 248 L20 248 Z" fill="url(#dancerBBody)" />

          {/* Hoodie pocket */}
          <rect x="50" y="190" width="40" height="28" rx="5" fill="#AA3B0A" />
          <line x1="70" y1="190" x2="70" y2="218" stroke="#C2410C" strokeWidth="2" />

          {/* Hoodie strings */}
          <line x1="60" y1="144" x2="55" y2="168" stroke="#FF8C35" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="144" x2="85" y2="168" stroke="#FF8C35" strokeWidth="2.5" strokeLinecap="round" />

          {/* Jeans */}
          <path d="M20 248 L20 286 L62 286 L70 264 L78 286 L120 286 L120 248 Z" fill="#1E3A5F" />
          {/* Jeans stitching */}
          <line x1="20" y1="260" x2="62" y2="260" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="78" y1="260" x2="120" y2="260" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* Sneakers */}
          <motion.g animate={legControls} style={{ transformOrigin: '45px 284px' }}>
            <rect x="22" y="278" width="40" height="16" rx="8" fill="#FFD700" />
            <rect x="22" y="278" width="40" height="8" rx="4" fill="white" />
            {/* Laces */}
            <line x1="28" y1="282" x2="56" y2="282" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="3,2" />
          </motion.g>
          <motion.g animate={legControls} style={{ transformOrigin: '95px 284px' }}>
            <rect x="78" y="278" width="40" height="16" rx="8" fill="#FFD700" />
            <rect x="78" y="278" width="40" height="8" rx="4" fill="white" />
            <line x1="84" y1="282" x2="112" y2="282" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="3,2" />
          </motion.g>

          {/* Left arm - pointing down/back */}
          <motion.g animate={armLControls} style={{ transformOrigin: '16px 147px' }}>
            <path d="M16 149 Q-8 170 -12 200" stroke="#7FF0FF" strokeWidth="14" fill="none" strokeLinecap="round" />
            <circle cx="-13" cy="203" r="11" fill="#7FF0FF" />
          </motion.g>

          {/* Right arm - pointing up */}
          <motion.g animate={armRControls} style={{ transformOrigin: '124px 147px' }}>
            <path d="M124 149 Q148 120 152 88" stroke="#7FF0FF" strokeWidth="14" fill="none" strokeLinecap="round" />
            <circle cx="153" cy="85" r="11" fill="#7FF0FF" />
            {/* Pointing finger */}
            <line x1="153" y1="74" x2="152" y2="62" stroke="#7FF0FF" strokeWidth="6" strokeLinecap="round" />
          </motion.g>

          {/* Floating cool elements */}
          <motion.text
            x="116" y="130" fontSize="15" fill="#9B5DE5"
            animate={isPlaying ? { y: [-5, -20], opacity: [1, 0], rotate: [0, 25] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }}
          >🔥</motion.text>
          <motion.text
            x="5" y="115" fontSize="13" fill="#00D2FF"
            animate={isPlaying ? { y: [-5, -18], opacity: [1, 0] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.9 }}
          >⚡</motion.text>
          <motion.text
            x="115" y="60" fontSize="11" fill="#FFD700"
            animate={isPlaying ? { y: [-5, -16], opacity: [1, 0] } : {}}
            transition={{ duration: 1.7, repeat: Infinity, delay: 0.2 }}
          >💫</motion.text>
        </svg>
      </motion.div>

      <motion.div
        className="mt-1 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ background: 'linear-gradient(90deg, #00D2FF, #9B5DE5)' }}
        animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
      >
        🕺 COOL
      </motion.div>
    </div>
  )
}
