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
  body: { y: number | number[]; x: number | number[]; rotate: number | number[] }
  armL: string; armR: string; legL: string; legR: string
}> = {
  idle: {
    body: { y: 0, x: 0, rotate: 0 },
    armL: 'M4,92 C-8,118 -12,148 -10,172',
    armR: 'M76,92 C88,118 92,148 90,172',
    legL: 'M28,162 C24,208 20,240 18,272',
    legR: 'M52,162 C56,208 60,240 62,272',
  },
  sway: {
    body: { y: [0, -5, 0], x: [0, 8, 0, -8, 0], rotate: [0, 5, 0, -5, 0] },
    armL: 'M4,92 C-20,108 -28,130 -22,158',
    armR: 'M76,92 C90,104 100,125 96,152',
    legL: 'M28,162 C20,205 16,238 14,270',
    legR: 'M52,162 C60,206 66,240 68,272',
  },
  groove: {
    body: { y: [0, -10, 0], x: [0, 12, 0, -12, 0], rotate: [0, 8, -8, 0] },
    armL: 'M4,92 C-30,88 -45,82 -42,62',
    armR: 'M76,92 C100,80 118,72 115,52',
    legL: 'M28,162 C14,192 6,218 10,252',
    legR: 'M52,162 C66,194 74,220 70,254',
  },
  bounce: {
    body: { y: [0, -20, 0], x: [0, 6, 0, -6, 0], rotate: [0, 3, -3, 0] },
    armL: 'M4,92 C-20,65 -18,35 -5,10',
    armR: 'M76,92 C98,68 96,38 82,12',
    legL: 'M28,162 C16,188 10,210 20,245',
    legR: 'M52,162 C64,188 70,212 60,246',
  },
  hype: {
    body: { y: [0, -26, 6, 0], x: [0, 10, -10, 0], rotate: [0, -10, 10, 0] },
    armL: 'M4,92 C-35,60 -50,25 -38,-5',
    armR: 'M76,92 C108,62 124,28 112,-2',
    legL: 'M28,162 C10,185 2,210 14,244',
    legR: 'M52,162 C70,186 78,212 66,246',
  },
}

export default function DancerA({ beat, isPlaying }: CharacterBeatProps) {
  const mode = getDanceMode(isPlaying, beat.bassEnergy, beat.isBeat)
  const pose = POSES[mode]
  const bpmDur = beat.bpm > 0 ? (60 / beat.bpm) : 0.5
  const glow = Math.round(beat.midEnergy * 16)

  const bodyAnim = useMemo(() => {
    if (typeof pose.body.y === 'number') return {}
    return { y: pose.body.y, x: pose.body.x, rotate: pose.body.rotate }
  }, [pose])

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.svg
        viewBox="-70 -10 220 320"
        width="110" height="275"
        style={{ filter: `drop-shadow(0 0 ${glow}px #FF6B9D) drop-shadow(0 0 ${glow * 1.5}px #00F5A0)` }}
        animate={bodyAnim}
        transition={{ duration: bpmDur, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="dancerAHead" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#FF9EC4" />
            <stop offset="100%" stopColor="#E91E8C" />
          </radialGradient>
          <linearGradient id="dancerATop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <circle cx="40" cy="20" r="36" fill="#7C3305" />
        <circle cx="16" cy="28" r="26" fill="#8B3E08" />
        <circle cx="64" cy="28" r="26" fill="#8B3E08" />
        <circle cx="40" cy="4" r="24" fill="#9C4A0A" />

        <circle cx="40" cy="38" r="30" fill="url(#dancerAHead)" />

        <circle cx="29" cy="36" r="10" fill="white" />
        <circle cx="51" cy="36" r="10" fill="white" />
        <text x="22" y="43" fontSize="15" fill="#FF1493">★</text>
        <text x="44" y="43" fontSize="15" fill="#FF1493">★</text>
        <circle cx="19" cy="43" r="7" fill="#FF69B4" opacity="0.3" />
        <circle cx="61" cy="43" r="7" fill="#FF69B4" opacity="0.3" />
        <path d="M26,52 Q40,62 54,52" stroke="#FF1493" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        <rect x="33" y="67" width="14" height="22" rx="6" fill="#FF9EC4" />

        <path d="M4,89 Q40,82 76,89 L73,148 Q40,155 7,148 Z" fill="url(#dancerATop)" />

        <motion.path d={pose.armL} stroke="#FF9EC4" strokeWidth="13" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut' }} />
        <motion.path d={pose.armR} stroke="#FF9EC4" strokeWidth="13" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut', delay: bpmDur * 0.25 }} />

        <path d="M7,148 Q40,155 73,148 L80,182 Q40,190 0,182 Z" fill="#00D4A0" />

        <motion.path d={pose.legL} stroke="#059669" strokeWidth="15" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut' }} />
        <motion.path d={pose.legR} stroke="#059669" strokeWidth="15" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut', delay: bpmDur * 0.5 }} />

        <ellipse cx="18" cy="276" rx="20" ry="8" fill="#FF6B35" />
        <ellipse cx="62" cy="276" rx="20" ry="8" fill="#FF6B35" />

        {isPlaying && ['♥','✦','★'].map((s, i) => (
          <motion.text key={i}
            x={[82, -25, 90][i]} y={[38, 60, 78][i]}
            fontSize="14" fill={['#FF6B9D','#FFD700','#00F5A0'][i]}
            animate={{ y: [0, -35], opacity: [1, 0] }}
            transition={{ duration: 1 + i * 0.4, repeat: Infinity, delay: i * 0.6 }}
          >{s}</motion.text>
        ))}
      </motion.svg>

      <motion.div className="px-3 py-1 rounded-full text-xs font-bold text-white mt-1"
        style={{ background: 'linear-gradient(90deg,#FF6B9D,#00F5A0)' }}
        animate={isPlaying ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: bpmDur, repeat: Infinity, delay: 0.3 }}
      >💃 FUNKY</motion.div>
    </div>
  )
}
