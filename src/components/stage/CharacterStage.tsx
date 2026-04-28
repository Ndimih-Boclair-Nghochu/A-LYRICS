'use client'
import { motion } from 'framer-motion'
import Singer from '@/components/characters/Singer'
import DancerA from '@/components/characters/DancerA'
import DancerB from '@/components/characters/DancerB'
import { usePlayerStore } from '@/store/playerStore'
import StageBackground from './StageBackground'

export default function CharacterStage() {
  const beat = usePlayerStore((s) => s.beat)
  const status = usePlayerStore((s) => s.player.status)
  const isPlaying = status === 'playing'

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #12082A 55%, #1A0A1A 100%)' }}
    >
      <StageBackground beat={beat} isPlaying={isPlaying} />

      {/* Characters row */}
      <div className="relative z-10 flex items-end justify-center gap-4 pb-8 w-full px-2">
        <motion.div
          className="flex-1 flex justify-center"
          animate={isPlaying ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <DancerA beat={beat} isPlaying={isPlaying} />
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center scale-110"
          animate={isPlaying ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Singer beat={beat} isPlaying={isPlaying} />
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center"
          animate={isPlaying ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <DancerB beat={beat} isPlaying={isPlaying} />
        </motion.div>
      </div>

      {/* Stage floor glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${
            isPlaying
              ? `rgba(155,93,229,${0.15 + beat.bassEnergy * 0.5}), rgba(0,210,255,${0.1 + beat.bassEnergy * 0.3}), transparent`
              : 'rgba(155,93,229,0.08), transparent'
          })`,
          transition: 'background 0.1s',
        }}
      />

      {/* Stage platform line */}
      <div className="absolute bottom-16 left-4 right-4 h-1 z-10 rounded-full overflow-hidden">
        <motion.div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(90deg, #FF6B9D, #9B5DE5, #00D2FF, #00F5A0, #FFD700, #FF6B35, #FF6B9D)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
