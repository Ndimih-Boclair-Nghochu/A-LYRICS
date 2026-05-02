'use client'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { CharacterBeatProps } from '@/types/beat'

type Mode = 'idle' | 'sway' | 'groove' | 'bounce' | 'hype'

function getDanceMode(isPlaying: boolean, energy: number, isBeat: boolean): Mode {
  if (!isPlaying) return 'idle'
  if (isBeat && energy > 0.6) return 'hype'
  if (energy > 0.55) return 'bounce'
  if (energy > 0.28) return 'groove'
  return 'sway'
}

const POSES: Record<Mode, {
  body: { y: number | number[]; rotate: number | number[] }
  armL: string; armR: string; legL: string; legR: string
}> = {
  idle: {
    body: { y: 0, rotate: 0 },
    armL: 'M4,92 C-8,118 -12,148 -10,172',
    armR: 'M76,92 C88,118 92,148 90,172',
    legL: 'M28,162 C24,208 20,240 18,272',
    legR: 'M52,162 C56,208 60,240 62,272',
  },
  sway: {
    body: { y: [0, -4, 0], rotate: [0, 2, -2, 0] },
    armL: 'M4,92 C-12,115 -18,140 -16,168',
    armR: 'M76,92 C90,110 96,135 94,162',
    legL: 'M28,162 C24,205 20,238 18,270',
    legR: 'M52,162 C57,206 62,240 64,272',
  },
  groove: {
    body: { y: [0, -8, 0], rotate: [0, 4, -4, 0] },
    armL: 'M4,92 C-25,100 -38,95 -32,75',
    armR: 'M76,92 C98,82 115,80 120,62',
    legL: 'M28,162 C18,200 14,232 12,265',
    legR: 'M52,162 C62,205 68,238 70,268',
  },
  bounce: {
    body: { y: [0, -16, 0], rotate: [0, 0, 0] },
    armL: 'M4,92 C-15,70 -10,48 0,28',
    armR: 'M76,92 C92,72 98,50 100,30',
    legL: 'M28,162 C20,195 16,220 22,255',
    legR: 'M52,162 C60,196 65,222 58,256',
  },
  hype: {
    body: { y: [0, -22, 4, 0], rotate: [0, -6, 6, 0] },
    armL: 'M4,92 C-28,68 -40,38 -30,8',
    armR: 'M76,92 C104,68 118,38 108,8',
    legL: 'M28,162 C14,190 8,215 18,248',
    legR: 'M52,162 C66,190 72,216 62,248',
  },
}

export default function Singer({ beat, isPlaying }: CharacterBeatProps) {
  const mode = getDanceMode(isPlaying, beat.bassEnergy, beat.isBeat)
  const pose = POSES[mode]
  const bpmDur = beat.bpm > 0 ? (60 / beat.bpm) : 0.5
  const glow = Math.round(beat.bassEnergy * 18)

  const bodyAnim = useMemo(() => {
    if (typeof pose.body.y === 'number') return {}
    return { y: pose.body.y, rotate: pose.body.rotate }
  }, [pose])

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.svg
        viewBox="-70 -10 220 320"
        width="120" height="290"
        style={{ filter: `drop-shadow(0 0 ${glow}px #FFD700) drop-shadow(0 0 ${glow * 1.5}px #FF6B9D)` }}
        animate={bodyAnim}
        transition={{ duration: bpmDur, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="singerHead" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <linearGradient id="singerShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>

        <rect x="33" y="63" width="14" height="24" rx="6" fill="#FBBF7A" />
        <path d="M2,87 Q40,80 78,87 L75,162 Q40,168 5,162 Z" fill="url(#singerShirt)" />

        <motion.path d={pose.armL} stroke="#FBBF7A" strokeWidth="13" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut' }} />
        <motion.path d={pose.armR} stroke="#FBBF7A" strokeWidth="13" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut' }} />

        <path d="M5,158 Q40,165 75,158 L72,178 Q40,184 8,178 Z" fill="#4C1D95" />

        <motion.path d={pose.legL} stroke="#5B21B6" strokeWidth="16" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut' }} />
        <motion.path d={pose.legR} stroke="#5B21B6" strokeWidth="16" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut', delay: bpmDur * 0.5 }} />

        <ellipse cx="18" cy="276" rx="22" ry="9" fill="#F59E0B" />
        <ellipse cx="62" cy="276" rx="22" ry="9" fill="#F59E0B" />

        <ellipse cx="22" cy="20" rx="16" ry="20" fill="#C2410C" transform="rotate(-20,22,20)" />
        <ellipse cx="40" cy="8" rx="18" ry="20" fill="#DC2626" />
        <ellipse cx="58" cy="20" rx="16" ry="20" fill="#C2410C" transform="rotate(20,58,20)" />

        <circle cx="40" cy="34" r="30" fill="url(#singerHead)" />
        <circle cx="40" cy="34" r="30" fill="none" stroke="#FF8C00" strokeWidth="1.5" />

        <circle cx="29" cy="32" r="10" fill="white" />
        <circle cx="51" cy="32" r="10" fill="white" />
        <circle cx="31" cy="34" r="6" fill="#1D4ED8" />
        <circle cx="53" cy="34" r="6" fill="#1D4ED8" />
        <circle cx="32" cy="33" r="3" fill="#0A0A20" />
        <circle cx="54" cy="33" r="3" fill="#0A0A20" />
        <circle cx="30" cy="31" r="2" fill="white" />
        <circle cx="52" cy="31" r="2" fill="white" />
        <circle cx="21" cy="40" r="8" fill="#FF69B4" opacity="0.35" />
        <circle cx="59" cy="40" r="8" fill="#FF69B4" opacity="0.35" />
        <motion.path d="M28,48 Q40,58 52,48" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round"
          animate={isPlaying ? { d: ['M28,48 Q40,58 52,48', 'M28,46 Q40,54 52,46', 'M28,48 Q40,58 52,48'] } : {}}
          transition={{ duration: bpmDur * 0.5, repeat: Infinity }} />

        <rect x="85" y="145" width="8" height="22" rx="4" fill="#6B7280" />
        <circle cx="89" cy="142" r="11" fill="#374151" />
        <circle cx="89" cy="142" r="7" fill="#4B5563" />

        <polygon points="40,100 43,110 54,110 45,116 48,126 40,120 32,126 35,116 26,110 37,110"
          fill="#FFD700" opacity="0.9" />

        {isPlaying && ['♪','♫','♬'].map((n, i) => (
          <motion.text key={i}
            x={i === 0 ? 95 : i === 1 ? -20 : 100} y={i === 0 ? 40 : i === 1 ? 70 : 80}
            fontSize="16" fill={['#FF6B9D','#00D2FF','#FFD700'][i]}
            animate={{ y: [0, -40], opacity: [1, 0] }}
            transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, delay: i * 0.5 }}
          >{n}</motion.text>
        ))}
      </motion.svg>

      <motion.div className="px-3 py-1 rounded-full text-xs font-bold text-white mt-1"
        style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5)' }}
        animate={isPlaying ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: bpmDur, repeat: Infinity }}
      >🎤 STAR</motion.div>
    </div>
  )
}
