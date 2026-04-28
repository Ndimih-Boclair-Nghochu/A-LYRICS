'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Invalid email or password'); return }
    router.push('/app')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl p-8 border border-slate-700/50"
        style={{ background: 'rgba(18,18,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(155,93,229,0.12)' }}>
        <div className="text-center mb-8">
          <motion.div className="text-4xl mb-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>🎵</motion.div>
          <h1 className="text-2xl font-black" style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00D2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to A+ LYRICS</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 transition-all text-sm"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 transition-all text-sm"
              placeholder="••••••••" />
          </div>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow: '0 4px 20px rgba(155,93,229,0.35)' }}>
            {loading ? '⟳ Signing in...' : 'Sign In →'}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-neon-purple hover:text-neon-pink transition-colors font-semibold">
            Create one free
          </Link>
        </div>
        <div className="mt-3 text-center">
          <Link href="/" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">← Back to home</Link>
        </div>
      </div>
    </motion.div>
  )
}
