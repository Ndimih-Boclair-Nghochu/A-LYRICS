'use client'
import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getPlan } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

interface Props {
  user: { name?: string | null; email: string; image?: string | null; plan: string; songsPlayedMonth: number }
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const plan = getPlan(user.plan as PlanId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/50 hover:border-slate-500 transition-all"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: plan.gradient }}>
          {initials}
        </div>
        <span className="text-white text-xs font-medium hidden sm:block max-w-24 truncate">
          {user.name ?? user.email.split('@')[0]}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${plan.color}25`, color: plan.color }}>
          {plan.emoji} {plan.name}
        </span>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-700/50 overflow-hidden z-50"
            style={{ background: 'rgba(18,18,42,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-700/30">
              <p className="text-white text-sm font-semibold truncate">{user.name ?? 'User'}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${plan.color}25`, color: plan.color }}>
                  {plan.emoji} {plan.name} Plan
                </span>
                {plan.songsPerMonth !== null && (
                  <span className="text-slate-600 text-xs">{user.songsPlayedMonth}/{plan.songsPerMonth} songs</span>
                )}
              </div>
            </div>

            {/* Menu items */}
            {[
              { href: '/app', icon: '🎵', label: 'Music Player' },
              { href: '/app/dashboard', icon: '📊', label: 'Dashboard' },
              { href: '/app/profile', icon: '👤', label: 'Profile' },
              { href: '/pricing', icon: '⚡', label: 'Upgrade Plan' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="border-t border-slate-700/30">
              <button
                onClick={() => void signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-sm"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
