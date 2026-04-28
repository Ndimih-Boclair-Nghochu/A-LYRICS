'use client'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'

const COLORS = ['#FF6B9D', '#00D2FF', '#FFD700', '#9B5DE5', '#00F5A0', '#FF6B35']

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${5 + (i * 5.5) % 90}%`,
  size: 3 + (i % 5) * 2,
  color: COLORS[i % COLORS.length],
  duration: 6 + (i % 5) * 2,
  delay: (i * 0.4) % 5,
  shape: i % 3,
}))

export default function Particles() {
  const isPlaying = usePlayerStore((s) => s.player.status === 'playing')
  const beat = usePlayerStore((s) => s.beat)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient background */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(155,93,229,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,210,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,107,157,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Animated noise / subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating orbs */}
      {[
        { x: '15%', y: '20%', color: '#9B5DE5', size: 300 },
        { x: '75%', y: '60%', color: '#00D2FF', size: 250 },
        { x: '50%', y: '80%', color: '#FF6B9D', size: 200 },
      ].map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}18, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: isPlaying ? [1, 1.1 + beat.bassEnergy * 0.2, 1] : [1, 1.05, 1],
            opacity: isPlaying ? [0.4, 0.7, 0.4] : [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}

      {/* Rising particles — only when playing */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={
            isPlaying
              ? {
                  y: [0, -(window?.innerHeight ?? 800) * 0.9],
                  opacity: [0, 0.8, 0.8, 0],
                  scale: [0.5, 1, 0.8, 0],
                }
              : { y: 0, opacity: 0 }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
