'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const COUNTRIES = ['Nigeria','Ghana','Kenya','South Africa','Uganda','Tanzania','Ethiopia','Cameroon','Senegal','Côte d\'Ivoire','Rwanda','Zimbabwe','Zambia','Mozambique','Mali','Other']

interface Profile { name: string | null; email: string; bio: string | null; country: string | null; avatar: string | null }

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ name: '', bio: '', country: '', avatar: '', currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then((d: Profile) => {
      setProfile(d)
      setForm(f => ({ ...f, name: d.name ?? '', bio: d.bio ?? '', country: d.country ?? '', avatar: d.avatar ?? '' }))
    }).catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const d: Profile = await res.json()
      setProfile(d)
      await update({ name: d.name, image: d.avatar, country: d.country })
      setMsg({ type: 'ok', text: 'Profile updated successfully!' })
    } else {
      setMsg({ type: 'err', text: 'Failed to save. Please try again.' })
    }
  }

  const initials = (form.name || profile?.email || '??').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen p-6" style={{ background: '#0A0A1A' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/app/dashboard" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">← Dashboard</Link>
        <h1 className="text-2xl font-black text-white mt-2 mb-6">Edit Profile</h1>

        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mb-5 p-4 rounded-xl text-sm font-medium border ${msg.type === 'ok' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {msg.text}
          </motion.div>
        )}

        <div className="rounded-2xl border border-slate-700/40 p-6 space-y-5"
          style={{ background: 'rgba(18,18,42,0.8)', backdropFilter: 'blur(16px)' }}>

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)' }}>
              {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : initials}
            </div>
            <div>
              <p className="text-white font-bold">{form.name || 'Your Name'}</p>
              <p className="text-slate-500 text-sm">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm"
                placeholder="Your name" />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Bio</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm resize-none"
                placeholder="Tell us about yourself..." maxLength={200} />
              <p className="text-slate-600 text-xs mt-1 text-right">{form.bio.length}/200</p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Country</label>
              <select value={form.country} onChange={e => set('country', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm">
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Avatar URL (optional)</label>
              <input type="url" value={form.avatar} onChange={e => set('avatar', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm"
                placeholder="https://..." />
            </div>

            <div className="border-t border-slate-700/30 pt-4">
              <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">Change Password</p>
              <div className="space-y-3">
                <input type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm"
                  placeholder="Current password (leave blank to skip)" />
                <input type="password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white focus:outline-none focus:border-neon-purple transition-all text-sm"
                  placeholder="New password (min 8 chars)" />
              </div>
            </div>

            <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow: '0 4px 20px rgba(155,93,229,0.3)' }}>
              {saving ? '⟳ Saving...' : 'Save Changes'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  )
}
