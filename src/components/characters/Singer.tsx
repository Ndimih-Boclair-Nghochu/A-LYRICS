'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { CharacterBeatProps } from '@/types/beat'

export default function Singer({ beat, isPlaying }: CharacterBeatProps) {
  const bodyControls = useAnimationControls()
  const armControls = useAnimationControls()
  const mouthControls = useAnimationControls()
  const noteControls = useAnimationControls()
  const mouthOpen = useRef(false)

  const swayDuration = beat.bpm > 0 ? 60 / beat.bpm : 0.5

  useEffect(() => {
    if (!isPlaying) {
      bodyControls.start({ y: 0, scaleX: 1, scaleY: 1, rotate: 0 })
      return
    }

    if (beat.isBeat) {
      mouthOpen.current = !mouthOpen.current
      void bodyControls.start({
        y: [-18, 0],
        scaleX: [1.08, 1],
        scaleY: [0.92, 1],
        transition: { duration: 0.18, ease: 'easeOut' },
      })
      void armControls.start({
        rotate: [-12, 0],
        transition: { duration: 0.2, ease: 'easeOut' },
      })
      void noteControls.start({
        y: [-30, -60],
        opacity: [1, 0],
        transition: { duration: 0.8, ease: 'easeOut' },
      })
    } else {
      void bodyControls.start({
        y: [0, -4, 0],
        rotate: [0, 2, -2, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity },
      })
    }
  }, [beat.isBeat, isPlaying, swayDuration, bodyControls, armControls, noteControls])

  useEffect(() => {
    if (isPlaying) {
      void mouthControls.start({
        scaleY: [1, 0.3, 1],
        transition: { duration: swayDuration * 0.5, repeat: Infinity, ease: 'easeInOut' },
      })
    } else {
      void mouthControls.start({ scaleY: 0.5 })
    }
  }, [isPlaying, swayDuration, mouthControls])

  const glowIntensity = Math.round(beat.bassEnergy * 15)

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.div animate={bodyControls} className="relative">
        <svg
          viewBox="0 0 160 300"
          xmlns="http://www.w3.org/2000/svg"
          width="130"
          height="240"
          style={{ filter: `drop-shadow(0 0 ${glowIntensity}px #FFD700) drop-shadow(0 0 ${glowIntensity * 2}px #FF6B9D)` }}
        >
          <defs>
            <radialGradient id="singerHeadGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#FFE866" />
              <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
            <radialGradient id="singerBodyGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#6D28D9" />
            </radialGradient>
            <filter id="singerGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Star halo */}
          <motion.polygon
            points="80,8 87,28 108,28 92,42 99,62 80,48 61,62 68,42 52,28 73,28"
            fill="#FFD700"
            opacity="0.35"
            animate={isPlaying ? { scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] } : {}}
            transition={{ duration: swayDuration, repeat: Infinity }}
            style={{ transformOrigin: '80px 35px' }}
          />

          {/* Hair (spiky, behind head) */}
          <ellipse cx="42" cy="72" rx="16" ry="22" fill="#FF4500" transform="rotate(-35,42,72)" />
          <ellipse cx="62" cy="52" rx="13" ry="20" fill="#FF5500" transform="rotate(-15,62,52)" />
          <ellipse cx="80" cy="46" rx="14" ry="22" fill="#FF4500" />
          <ellipse cx="98" cy="52" rx="13" ry="20" fill="#FF5500" transform="rotate(15,98,52)" />
          <ellipse cx="118" cy="72" rx="16" ry="22" fill="#FF4500" transform="rotate(35,118,72)" />

          {/* Head */}
          <circle cx="80" cy="92" r="48" fill="url(#singerHeadGrad)" />
          <circle cx="80" cy="92" r="48" fill="none" stroke="#FF8C00" strokeWidth="2" />

          {/* Blush */}
          <circle cx="50" cy="104" r="11" fill="#FF69B4" opacity="0.38" />
          <circle cx="110" cy="104" r="11" fill="#FF69B4" opacity="0.38" />

          {/* Left eye */}
          <circle cx="63" cy="85" r="14" fill="white" />
          <circle cx="66" cy="88" r="9" fill="#1E40AF" />
          <circle cx="68" cy="90" r="5" fill="#0A0A20" />
          <circle cx="66" cy="86" r="3" fill="white" />
          <circle cx="71" cy="89" r="1.5" fill="white" />
          {/* Eyelash left */}
          <line x1="51" y1="76" x2="55" y2="72" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="72" x2="61" y2="68" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="69" y1="72" x2="72" y2="69" stroke="#333" strokeWidth="2" strokeLinecap="round" />

          {/* Right eye */}
          <circle cx="97" cy="85" r="14" fill="white" />
          <circle cx="100" cy="88" r="9" fill="#1E40AF" />
          <circle cx="102" cy="90" r="5" fill="#0A0A20" />
          <circle cx="100" cy="86" r="3" fill="white" />
          <circle cx="105" cy="89" r="1.5" fill="white" />
          {/* Eyelash right */}
          <line x1="88" y1="72" x2="91" y2="69" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="97" y1="72" x2="99" y2="68" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <line x1="106" y1="72" x2="109" y2="72" stroke="#333" strokeWidth="2" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M50 70 Q63 61 76 68" stroke="#C2410C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M84 68 Q97 61 110 70" stroke="#C2410C" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Mouth - animated */}
          <motion.g animate={mouthControls} style={{ transformOrigin: '80px 115px' }}>
            <ellipse cx="80" cy="115" rx="16" ry="13" fill="#E11D48" />
            <ellipse cx="80" cy="119" rx="12" ry="8" fill="#7F1D1D" />
            <path d="M66 112 Q80 108 94 112" fill="white" />
            <circle cx="75" cy="113" r="2" fill="white" opacity="0.5" />
            <circle cx="85" cy="113" r="2" fill="white" opacity="0.5" />
          </motion.g>

          {/* Neck */}
          <rect x="68" y="135" width="24" height="22" fill="#FFD580" />

          {/* Body / shirt */}
          <path d="M22 157 L50 144 L80 150 L110 144 L138 157 L133 248 L27 248 Z" fill="url(#singerBodyGrad)" />

          {/* Collar */}
          <path d="M63 144 L80 158 L97 144" fill="white" stroke="#DDD" strokeWidth="1" />

          {/* Star on shirt */}
          <polygon
            points="80,170 84,182 97,182 87,190 91,202 80,194 69,202 73,190 63,182 76,182"
            fill="#FFD700"
            opacity="0.8"
          />

          {/* Belt */}
          <rect x="27" y="240" width="106" height="11" rx="3" fill="#FFD700" />
          <rect x="68" y="237" width="24" height="18" rx="3" fill="#D97706" />
          <circle cx="80" cy="246" r="5" fill="#FFD700" />

          {/* Pants */}
          <path d="M27 251 L27 284 L70 284 L80 264 L90 284 L133 284 L133 251 Z" fill="#5B21B6" />

          {/* Shoes */}
          <ellipse cx="52" cy="287" rx="22" ry="9" fill="#FFD700" />
          <ellipse cx="108" cy="287" rx="22" ry="9" fill="#FFD700" />
          <rect x="34" y="280" width="36" height="10" rx="5" fill="#F59E0B" />
          <rect x="90" y="280" width="36" height="10" rx="5" fill="#F59E0B" />

          {/* Left arm with mic */}
          <motion.g animate={armControls} style={{ transformOrigin: '27px 160px' }}>
            <path d="M27 162 Q4 182 -2 210" stroke="#FFD700" strokeWidth="15" fill="none" strokeLinecap="round" />
            {/* Mic handle */}
            <rect x="-10" y="206" width="12" height="24" rx="6" fill="#9CA3AF" />
            {/* Mic grill */}
            <circle cx="-4" cy="203" r="14" fill="#374151" />
            <circle cx="-4" cy="203" r="11" fill="#4B5563" />
            <circle cx="-4" cy="203" r="7" fill="#6B7280" opacity="0.5" />
            <line x1="-15" y1="203" x2="7" y2="203" stroke="#9CA3AF" strokeWidth="1.2" />
            <line x1="-14" y1="197" x2="6" y2="197" stroke="#9CA3AF" strokeWidth="1.2" />
            <line x1="-14" y1="209" x2="6" y2="209" stroke="#9CA3AF" strokeWidth="1.2" />
            {/* Mic stand grip stripe */}
            <rect x="-11" y="218" width="14" height="3" rx="1" fill="#6B7280" />
            <rect x="-11" y="224" width="14" height="3" rx="1" fill="#6B7280" />
          </motion.g>

          {/* Right arm raised */}
          <motion.g animate={armControls} style={{ transformOrigin: '133px 160px' }}>
            <path d="M133 162 Q156 138 160 110" stroke="#FFD700" strokeWidth="15" fill="none" strokeLinecap="round" />
            <circle cx="161" cy="107" r="12" fill="#FFD700" />
          </motion.g>

          {/* Floating music notes */}
          <motion.text
            x="138" y="58" fontSize="20" fill="#FF6B9D"
            animate={isPlaying ? { y: [-5, -25], opacity: [1, 0], rotate: [0, 20] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          >♪</motion.text>
          <motion.text
            x="12" y="90" fontSize="17" fill="#00D2FF"
            animate={isPlaying ? { y: [-5, -25], opacity: [1, 0], rotate: [0, -15] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          >♫</motion.text>
          <motion.text
            x="140" y="130" fontSize="14" fill="#FFE66D"
            animate={isPlaying ? { y: [-5, -25], opacity: [1, 0] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
          >♬</motion.text>
        </svg>
      </motion.div>

      {/* Label */}
      <motion.div
        className="mt-1 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ background: 'linear-gradient(90deg, #FF6B9D, #9B5DE5)' }}
        animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        🎤 STAR
      </motion.div>
    </div>
  )
}
