'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const COUNTRIES = ['Nigeria','Ghana','Kenya','South Africa','Uganda','Tanzania','Ethiopia','Cameroon','Senegal','Côte d\'Ivoire','Rwanda','Zimbabwe','Zambia','Mozambique','Mali','Other']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data: { error: Record<string, string[]> | string } = await res.json()
        if (typeof data.error === 'object') {
          setErrors(Object.fromEntries(Object.entries(data.error).map(([k, v]) => [k, v[0]])))
        } else {
          setErrors({ general: String(data.error) })
        }
        setLoading(false)
        return
      }

      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.error) {
        setErrors({ general: 'Account created but sign-in failed. Please log in manually.' })
        setLoading(false)
        return
      }
      router.push('/app')
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' })
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="rounded-3xl p-8 border border-slate-700/50"
        style={{ background: 'rgba(18,18,42,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(155,93,229,0.12)' }}>
        <div className="text-center mb-8">
          <motion.div className="text-4xl mb-3" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>🎤</motion.div>
          <h1 className="text-2xl font-black" style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00D2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Join A+ LYRICS
          </h1>
          <p className="text-slate-400 text-sm mt-1">Free forever · Upgrade anytime</p>
        </div>

        {errors.general && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {errors.general}
          </motion.div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Amara Johnson' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all text-sm"
                style={{ borderColor: errors[key] ? '#EF4444' : 'rgba(100,116,139,0.5)', '--tw-ring-color': '#9B5DE5' } as React.CSSProperties}
                placeholder={placeholder} />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Country</label>
            <select value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm">
              <option value="">Select country (optional)</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow: '0 4px 20px rgba(155,93,229,0.35)' }}>
            {loading ? '⟳ Creating account...' : 'Create Free Account →'}
          </motion.button>
        </form>

        <p className="text-slate-600 text-xs text-center mt-4">
          By signing up you agree to our Terms & Privacy Policy.
        </p>
        <div className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-neon-purple hover:text-neon-pink transition-colors font-semibold">Sign in</Link>
        </div>
      </div>
    </motion.div>
  )
}
