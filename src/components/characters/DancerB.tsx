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
    body: { y: [0, -4, 0], rotate: [0, -3, 3, 0] },
    armL: 'M4,92 C-18,105 -28,125 -24,155',
    armR: 'M76,92 C95,108 108,130 104,158',
    legL: 'M28,162 C22,205 18,238 16,270',
    legR: 'M52,162 C58,206 64,240 66,272',
  },
  groove: {
    body: { y: [0, -12, 0], rotate: [0, -6, 6, 0] },
    armL: 'M4,92 C-22,85 -38,78 -36,58',
    armR: 'M76,92 C108,98 128,95 130,72',
    legL: 'M28,162 C16,196 8,225 12,258',
    legR: 'M52,162 C64,198 72,228 68,260',
  },
  bounce: {
    body: { y: [0, -18, 0], rotate: [0, 0, 0] },
    armL: 'M4,92 C-25,72 -30,45 -18,18',
    armR: 'M76,92 C102,75 112,50 100,22',
    legL: 'M28,162 C18,192 12,218 22,252',
    legR: 'M52,162 C62,194 68,220 58,254',
  },
  hype: {
    body: { y: [0, -24, 5, 0], rotate: [0, 8, -8, 0] },
    armL: 'M4,92 C-38,65 -52,28 -38,-4',
    armR: 'M76,92 C112,68 130,32 116,-1',
    legL: 'M28,162 C12,188 4,214 16,248',
    legR: 'M52,162 C68,188 76,215 64,249',
  },
}

export default function DancerB({ beat, isPlaying }: CharacterBeatProps) {
  const mode = getDanceMode(isPlaying, beat.bassEnergy, beat.isBeat)
  const pose = POSES[mode]
  const bpmDur = beat.bpm > 0 ? (60 / beat.bpm) : 0.5
  const glow = Math.round(beat.midEnergy * 16)

  const bodyAnim = useMemo(() => {
    if (typeof pose.body.y === 'number') return {}
    return { y: pose.body.y, rotate: pose.body.rotate }
  }, [pose])

  return (
    <div className="relative flex flex-col items-center select-none">
      <motion.svg
        viewBox="-70 -10 220 320"
        width="110" height="275"
        style={{ filter: `drop-shadow(0 0 ${glow}px #00D2FF) drop-shadow(0 0 ${glow * 1.5}px #9B5DE5)` }}
        animate={bodyAnim}
        transition={{ duration: bpmDur, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="dancerBHead" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#0284C7" />
          </radialGradient>
          <linearGradient id="dancerBHoodie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        <ellipse cx="40" cy="14" rx="36" ry="10" fill="#1D4ED8" />
        <rect x="8" y="4" width="64" height="18" rx="6" fill="#2563EB" />
        <ellipse cx="40" cy="4" rx="30" ry="8" fill="#1D4ED8" />
        <ellipse cx="40" cy="22" rx="42" ry="7" fill="#1E3A8A" />

        <circle cx="40" cy="42" r="30" fill="url(#dancerBHead)" />

        <circle cx="29" cy="40" r="10" fill="white" />
        <circle cx="51" cy="40" r="10" fill="white" />
        <circle cx="31" cy="42" r="6" fill="#0284C7" />
        <circle cx="53" cy="42" r="6" fill="#0284C7" />
        <circle cx="32" cy="41" r="3" fill="#082F49" />
        <circle cx="54" cy="41" r="3" fill="#082F49" />
        <circle cx="30" cy="39" r="2" fill="white" />
        <circle cx="52" cy="39" r="2" fill="white" />
        <circle cx="19" cy="48" r="7" fill="#38BDF8" opacity="0.25" />
        <circle cx="61" cy="48" r="7" fill="#38BDF8" opacity="0.25" />
        <path d="M28,55 Q40,64 52,55" stroke="#0EA5E9" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        <rect x="33" y="71" width="14" height="20" rx="6" fill="#93C5FD" />

        <path d="M3,91 Q40,84 77,91 L74,165 Q40,172 6,165 Z" fill="url(#dancerBHoodie)" />
        <circle cx="36" cy="98" r="3" fill="#CBD5E1" />
        <circle cx="44" cy="98" r="3" fill="#CBD5E1" />
        <rect x="28" y="140" width="24" height="16" rx="4" fill="rgba(0,0,0,0.2)" />

        <motion.path d={pose.armL} stroke="#93C5FD" strokeWidth="14" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut' }} />
        <motion.path d={pose.armR} stroke="#93C5FD" strokeWidth="14" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur * 0.8, ease: 'easeInOut', delay: bpmDur * 0.25 }} />

        <path d="M6,162 Q40,170 74,162 L76,185 Q40,192 4,185 Z" fill="#0F172A" />

        <motion.path d={pose.legL} stroke="#1E293B" strokeWidth="16" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut' }} />
        <motion.path d={pose.legR} stroke="#1E293B" strokeWidth="16" strokeLinecap="round" fill="none"
          transition={{ duration: bpmDur, ease: 'easeInOut', delay: bpmDur * 0.5 }} />

        <ellipse cx="18" cy="276" rx="22" ry="9" fill="#E2E8F0" />
        <ellipse cx="62" cy="276" rx="22" ry="9" fill="#E2E8F0" />
        <rect x="6" y="268" width="26" height="10" rx="5" fill="white" />
        <rect x="50" y="268" width="26" height="10" rx="5" fill="white" />
        <line x1="10" y1="270" x2="28" y2="270" stroke="#60A5FA" strokeWidth="2" />
        <line x1="54" y1="270" x2="72" y2="270" stroke="#60A5FA" strokeWidth="2" />

        {isPlaying && ['⚡','🔥','💫'].map((s, i) => (
          <motion.text key={i}
            x={[85, -30, 88][i]} y={[42, 55, 70][i]}
            fontSize="14"
            animate={{ y: [0, -32], opacity: [1, 0] }}
            transition={{ duration: 1.1 + i * 0.35, repeat: Infinity, delay: i * 0.55 }}
          >{s}</motion.text>
        ))}
      </motion.svg>

      <motion.div className="px-3 py-1 rounded-full text-xs font-bold text-white mt-1"
        style={{ background: 'linear-gradient(90deg,#00D2FF,#9B5DE5)' }}
        animate={isPlaying ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: bpmDur, repeat: Infinity, delay: 0.6 }}
      >🕺 COOL</motion.div>
    </div>
  )
}
