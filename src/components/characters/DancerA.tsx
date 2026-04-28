'use client'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import type { CharacterBeatProps } from '@/types/beat'

export default function DancerA({ beat, isPlaying }: CharacterBeatProps) {
  const bodyControls = useAnimationControls()
  const armLControls = useAnimationControls()
  const armRControls = useAnimationControls()
  const hairControls = useAnimationControls()

  const swayDuration = beat.bpm > 0 ? 60 / beat.bpm : 0.5

  useEffect(() => {
    if (!isPlaying) {
      bodyControls.start({ y: 0, rotate: 0, x: 0 })
      armLControls.start({ rotate: 0 })
      armRControls.start({ rotate: 0 })
      hairControls.start({ scale: 1 })
      return
    }

    if (beat.isBeat) {
      void bodyControls.start({
        y: [-20, 0],
        x: [6, -6, 0],
        rotate: [8, -8, 0],
        transition: { duration: 0.22, ease: 'easeOut' },
      })
      void armLControls.start({
        rotate: [-25, 0],
        transition: { duration: 0.2 },
      })
      void armRControls.start({
        rotate: [25, 0],
        transition: { duration: 0.2 },
      })
      void hairControls.start({
        scale: [1.1, 1],
        transition: { duration: 0.3, ease: 'easeOut' },
      })
    } else {
      void bodyControls.start({
        x: [0, 8, 0, -8, 0],
        rotate: [0, 5, 0, -5, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity },
      })
      void armLControls.start({
        rotate: [0, -15, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity },
      })
      void armRControls.start({
        rotate: [0, 15, 0],
        transition: { duration: swayDuration, ease: 'easeInOut', repeat: Infinity, delay: swayDuration / 2 },
      })
    }
  }, [beat.isBeat, isPlaying, swayDuration, bodyControls, armLControls, armRControls, hairControls])

  const glowIntensity = Math.round(beat.midEnergy * 14)

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.div animate={bodyControls} className="relative">
        <svg
          viewBox="0 0 140 290"
          xmlns="http://www.w3.org/2000/svg"
          width="110"
          height="220"
          style={{ filter: `drop-shadow(0 0 ${glowIntensity}px #FF6B9D) drop-shadow(0 0 ${glowIntensity * 2}px #00F5A0)` }}
        >
          <defs>
            <radialGradient id="dancerAHead" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#FF9EC4" />
              <stop offset="100%" stopColor="#E91E8C" />
            </radialGradient>
            <radialGradient id="dancerABody" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
          </defs>

          {/* Big afro hair (behind head) */}
          <motion.g animate={hairControls} style={{ transformOrigin: '70px 68px' }}>
            <circle cx="70" cy="55" r="38" fill="#6B2B00" />
            <circle cx="45" cy="62" r="28" fill="#7C3305" />
            <circle cx="95" cy="62" r="28" fill="#7C3305" />
            <circle cx="55" cy="40" r="24" fill="#8B3E08" />
            <circle cx="85" cy="40" r="24" fill="#8B3E08" />
            <circle cx="70" cy="32" r="22" fill="#9C4A0A" />
            <circle cx="40" cy="75" r="20" fill="#6B2B00" />
            <circle cx="100" cy="75" r="20" fill="#6B2B00" />
            {/* Hair shine */}
            <circle cx="58" cy="38" r="8" fill="white" opacity="0.12" />
          </motion.g>

          {/* Head */}
          <circle cx="70" cy="88" r="42" fill="url(#dancerAHead)" />
          <circle cx="70" cy="88" r="42" fill="none" stroke="#FF1493" strokeWidth="2" />

          {/* Blush */}
          <circle cx="45" cy="98" r="10" fill="#FF69B4" opacity="0.4" />
          <circle cx="95" cy="98" r="10" fill="#FF69B4" opacity="0.4" />

          {/* Star eyes (excited expression) */}
          {/* Left eye */}
          <circle cx="55" cy="82" r="13" fill="white" />
          <text x="43" y="90" fontSize="17" fill="#FF1493">★</text>
          {/* Right eye */}
          <circle cx="85" cy="82" r="13" fill="white" />
          <text x="73" y="90" fontSize="17" fill="#FF1493">★</text>

          {/* Eyebrows */}
          <path d="M43 67 Q55 59 67 65" stroke="#6B2B00" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M73 65 Q85 59 97 67" stroke="#6B2B00" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Big smile */}
          <path d="M48 105 Q70 122 92 105" stroke="#FF1493" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M52 107 Q70 118 88 107" fill="white" />

          {/* Dimples */}
          <circle cx="48" cy="108" r="3" fill="#FF69B4" opacity="0.5" />
          <circle cx="92" cy="108" r="3" fill="#FF69B4" opacity="0.5" />

          {/* Neck */}
          <rect x="58" y="125" width="24" height="20" fill="#FF9EC4" />

          {/* Body */}
          <path d="M18 145 L48 133 L70 140 L92 133 L122 145 L118 240 L22 240 Z" fill="url(#dancerABody)" />

          {/* Dress details */}
          <path d="M42 133 L70 148 L98 133" fill="white" opacity="0.3" />
          {/* Polka dots */}
          <circle cx="55" cy="165" r="5" fill="#FFD700" opacity="0.8" />
          <circle cx="85" cy="172" r="5" fill="#FFD700" opacity="0.8" />
          <circle cx="65" cy="185" r="4" fill="#FFD700" opacity="0.8" />
          <circle cx="78" cy="158" r="4" fill="white" opacity="0.6" />

          {/* Skirt flare */}
          <path d="M22 240 L10 285 L130 285 L118 240 Z" fill="#00D4A0" />
          {/* Skirt detail */}
          <path d="M20 255 L8 285" stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <path d="M40 248 L30 285" stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <path d="M70 245 L70 285" stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <path d="M100 248 L110 285" stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <path d="M120 255 L132 285" stroke="#FFD700" strokeWidth="2" opacity="0.5" />

          {/* Shoes */}
          <rect x="28" y="277" width="34" height="14" rx="7" fill="#FF6B35" />
          <rect x="78" y="277" width="34" height="14" rx="7" fill="#FF6B35" />
          <ellipse cx="45" cy="291" rx="17" ry="5" fill="#CC4400" />
          <ellipse cx="95" cy="291" rx="17" ry="5" fill="#CC4400" />

          {/* Left arm raised (V-pose) */}
          <motion.g animate={armLControls} style={{ transformOrigin: '18px 148px' }}>
            <path d="M18 150 Q-8 125 -14 95" stroke="#FF9EC4" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Hand open */}
            <circle cx="-15" cy="93" r="11" fill="#FF9EC4" />
            <line x1="-15" y1="82" x2="-18" y2="72" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
            <line x1="-10" y1="83" x2="-8" y2="72" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
            <line x1="-20" y1="85" x2="-26" y2="76" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
          </motion.g>

          {/* Right arm raised (V-pose) */}
          <motion.g animate={armRControls} style={{ transformOrigin: '122px 148px' }}>
            <path d="M122 150 Q148 125 154 95" stroke="#FF9EC4" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Hand open */}
            <circle cx="155" cy="93" r="11" fill="#FF9EC4" />
            <line x1="155" y1="82" x2="152" y2="72" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="83" x2="148" y2="72" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1="85" x2="166" y2="76" stroke="#FF9EC4" strokeWidth="6" strokeLinecap="round" />
          </motion.g>

          {/* Heart sparkles */}
          <motion.text
            x="122" y="55" fontSize="16" fill="#FF6B9D"
            animate={isPlaying ? { y: [-5, -22], opacity: [1, 0], scale: [1, 1.3] } : {}}
            transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }}
          >♥</motion.text>
          <motion.text
            x="5" y="80" fontSize="14" fill="#FFD700"
            animate={isPlaying ? { y: [-5, -20], opacity: [1, 0] } : {}}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.7 }}
          >✦</motion.text>
          <motion.text
            x="118" y="95" fontSize="12" fill="#00F5A0"
            animate={isPlaying ? { y: [-5, -18], opacity: [1, 0] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, delay: 1 }}
          >★</motion.text>
        </svg>
      </motion.div>

      <motion.div
        className="mt-1 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ background: 'linear-gradient(90deg, #FF6B9D, #00F5A0)' }}
        animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      >
        💃 FUNKY
      </motion.div>
    </div>
  )
}
