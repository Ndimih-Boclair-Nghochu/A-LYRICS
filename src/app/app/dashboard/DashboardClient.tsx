'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getPlan, PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

interface UserData { plan: string; songsPlayedMonth: number; planExpiresAt: string | null; createdAt: string; email: string; name: string | null; country: string | null }

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then((d: UserData) => setUserData(d)).catch(() => {})
  }, [])

  const plan = getPlan((userData?.plan ?? 'FREE') as PlanId)
  const songsPlayed = userData?.songsPlayedMonth ?? 0
  const limit = plan.songsPerMonth
  const usagePct = limit ? Math.min((songsPlayed / limit) * 100, 100) : 0

  const card = (children: React.ReactNode, extra?: string) => (
    <div className={`rounded-2xl border border-slate-700/40 p-5 ${extra ?? ''}`}
      style={{ background: 'rgba(18,18,42,0.7)', backdropFilter: 'blur(12px)' }}>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: '#0A0A1A' }}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/app" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">← Player</Link>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Dashboard</h1>
            <p className="text-slate-500 text-sm">Welcome back, {userData?.name ?? 'Superstar'} 🎵</p>
          </div>
          <Link href="/pricing" className="px-3 sm:px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold transition-all hover:scale-105 shrink-0"
            style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)' }}>
            ⚡ Upgrade
          </Link>
        </div>

        {/* Plan status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 border"
          style={{ background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}08)`, borderColor: `${plan.color}30` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{plan.emoji}</span>
              <div>
                <h2 className="text-xl font-black text-white">{plan.name} Plan</h2>
                <p className="text-slate-400 text-sm">{plan.tagline}</p>
              </div>
            </div>
            {plan.id !== 'FREE' && userData?.planExpiresAt && (
              <div className="text-right">
                <p className="text-slate-400 text-xs">Renews</p>
                <p className="text-white text-sm font-bold">{new Date(userData.planExpiresAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Usage bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Songs this month</span>
              <span>{songsPlayed}{limit ? ` / ${limit}` : ' (unlimited)'}</span>
            </div>
            {limit && (
              <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${usagePct}%` }} transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: usagePct > 80 ? 'linear-gradient(90deg,#FF6B35,#EF4444)' : `linear-gradient(90deg, ${plan.color}, ${plan.color}99)` }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Songs Played', value: songsPlayed, icon: '🎵', color: '#FF6B9D' },
            { label: 'Current Plan', value: plan.name, icon: plan.emoji, color: plan.color },
            { label: 'Country', value: userData?.country ?? '—', icon: '🌍', color: '#00D2FF' },
            { label: 'Member Since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '—', icon: '📅', color: '#9B5DE5' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              {card(
                <>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-white font-black text-lg" style={{ color: stat.color }}>{stat.value}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Plan comparison / upgrade */}
        {plan.id !== 'VIP' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {card(
              <>
                <h3 className="text-white font-bold mb-4">Available Upgrades</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PLANS.filter(p => p.id !== 'FREE' && p.id !== plan.id).map(p => (
                    <Link key={p.id} href={`/pricing?plan=${p.id}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/40 hover:border-opacity-70 transition-all group"
                      style={{ background: `${p.color}08`, borderColor: `${p.color}25` }}>
                      <span className="text-xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold">{p.name}</p>
                        <p className="text-slate-500 text-xs">{p.songsPerMonth ? `${p.songsPerMonth}/mo` : 'Unlimited'}</p>
                      </div>
                      <span className="font-black text-xs" style={{ color: p.color }}>₦{(p.priceNGN/1000).toFixed(0)}k/mo</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { href: '/app', icon: '🎵', label: 'Play Music' },
            { href: '/app/profile', icon: '👤', label: 'Edit Profile' },
            { href: '/pricing', icon: '⚡', label: 'Upgrade' },
            { href: '/', icon: '🏠', label: 'Home' },
          ].map(action => (
            <Link key={action.href} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700/40 hover:border-slate-500 hover:bg-white/5 transition-all text-center">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-slate-300 text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
