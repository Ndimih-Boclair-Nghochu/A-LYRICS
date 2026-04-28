'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

const FEATURES = [
  { icon: '🎤', title: 'Animated Sticker Characters', desc: 'Three funny human stickers — STAR (mic), FUNKY (dancer) & COOL — groove to the beat in real time.' },
  { icon: '🎵', title: 'Beat-Reactive Stage', desc: 'Web Audio API detects every bass hit. Characters jump, glow and pulse exactly with the music.' },
  { icon: '📝', title: 'Synchronized Lyrics', desc: 'Search any song, get lyrics from our database, and watch them scroll in karaoke style.' },
  { icon: '📤', title: 'Upload Your Music', desc: 'Drag & drop your own MP3/audio file and see your stickers dance to it instantly.' },
  { icon: '🔍', title: 'Music Search', desc: 'Type any artist or song title — we find it, stream a preview, and fetch the lyrics automatically.' },
  { icon: '🌍', title: 'Africa-First Payments', desc: 'Upgrade with card, mobile money, bank transfer & USSD via Flutterwave — works across Africa.' },
]

export default function LandingClient() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0A0A1A', color: 'white' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800/50"
        style={{ background: 'rgba(10,10,26,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <motion.span className="text-2xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>🎵</motion.span>
          <span className="font-black text-xl"
            style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00D2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            A+ LYRICS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block">Pricing</Link>
          <Link href="/auth/login" className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm hover:border-slate-500 transition-all">Sign In</Link>
          <Link href="/auth/register" className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow: '0 4px 14px rgba(155,93,229,0.4)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background orbs */}
        {[{x:'15%',y:'25%',c:'#9B5DE5',s:500},{x:'75%',y:'60%',c:'#00D2FF',s:400},{x:'50%',y:'85%',c:'#FF6B9D',s:300}].map((o,i)=>(
          <motion.div key={i} className="absolute rounded-full pointer-events-none"
            style={{ left:o.x, top:o.y, width:o.s, height:o.s, background:`radial-gradient(circle,${o.c}12,transparent 70%)`, transform:'translate(-50%,-50%)' }}
            animate={{ scale:[1,1.1,1], opacity:[0.4,0.6,0.4] }}
            transition={{ duration:4+i*2, repeat:Infinity, ease:'easeInOut', delay:i }}
          />
        ))}

        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }} className="text-center relative z-10 max-w-4xl">
          {/* Sticker preview */}
          <div className="flex items-end justify-center gap-2 mb-8">
            {['💃','🎤','🕺'].map((e, i) => (
              <motion.div key={i} className={`text-${i===1?'7xl':'5xl'}`}
                animate={{ y:[0, i===1?-12:-6, 0], rotate:[0, i%2===0?8:-8, 0] }}
                transition={{ duration:1.5+i*0.3, repeat:Infinity, ease:'easeInOut', delay:i*0.2 }}>
                {e}
              </motion.div>
            ))}
          </div>

          <motion.h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            style={{ background:'linear-gradient(135deg,#FF6B9D 0%,#FFD700 30%,#00F5A0 60%,#00D2FF 80%,#9B5DE5 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Where Music<br />Comes Alive
          </motion.h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Search any song, get instant lyrics, and watch <strong className="text-white">3 funny animated characters</strong> dance to the beat — powered by real audio analysis.
          </motion.p>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register"
              className="px-8 py-4 rounded-2xl text-white font-black text-lg w-full sm:w-auto text-center"
              style={{ background:'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow:'0 8px 32px rgba(155,93,229,0.45)' }}>
              <motion.span animate={{ scale:[1,1.03,1] }} transition={{ duration:2, repeat:Infinity }}>🚀 Start for Free</motion.span>
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-2xl border border-slate-600 text-slate-300 font-semibold text-lg w-full sm:w-auto text-center hover:border-slate-400 transition-all">
              View Pricing ↓
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Everything You Need</h2>
        <p className="text-slate-500 text-center mb-12">Built for music lovers across Africa and beyond</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }} viewport={{ once:true }}
              className="rounded-2xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
              style={{ background:'rgba(18,18,42,0.6)', backdropFilter:'blur(12px)' }}>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-4 py-20" style={{ background:'rgba(18,18,42,0.4)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Pricing for Africa</h2>
          <p className="text-slate-500 text-center mb-12">Pay with mobile money, card, or bank transfer via Flutterwave</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }} viewport={{ once:true }}
                className={`rounded-2xl p-5 border text-center ${plan.popular ? 'scale-105' : ''}`}
                style={{ background:`${plan.color}10`, borderColor:`${plan.color}35`, backdropFilter:'blur(12px)' }}>
                <div className="text-3xl mb-2">{plan.emoji}</div>
                <h3 className="text-white font-black mb-1">{plan.name}</h3>
                <div className="text-2xl font-black mb-1" style={{ color:plan.color }}>
                  {plan.priceNGN === 0 ? 'Free' : `₦${(plan.priceNGN/1000).toFixed(0)}k`}
                </div>
                {plan.priceNGN > 0 && <p className="text-slate-600 text-xs mb-3">/month</p>}
                <p className="text-slate-400 text-xs">{plan.songsPerMonth ? `${plan.songsPerMonth} songs/mo` : 'Unlimited'}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="px-8 py-3.5 rounded-xl text-white font-bold inline-block"
              style={{ background:'linear-gradient(135deg,#FF6B9D,#9B5DE5)', boxShadow:'0 4px 20px rgba(155,93,229,0.35)' }}>
              See Full Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center">
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
          <div className="text-6xl mb-6">
            <motion.span animate={{ rotate:[0,15,-15,0] }} transition={{ duration:2, repeat:Infinity }}>🎵</motion.span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to Vibe?</h2>
          <p className="text-slate-400 text-lg mb-8">Join thousands of music lovers. Free forever, upgrade when you want.</p>
          <Link href="/auth/register" className="px-10 py-4 rounded-2xl text-white font-black text-xl inline-block"
            style={{ background:'linear-gradient(135deg,#FF6B9D,#FFD700,#00F5A0,#00D2FF,#9B5DE5)', backgroundSize:'300% 100%', boxShadow:'0 8px 40px rgba(155,93,229,0.5)' }}>
            Create Free Account 🚀
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span>© 2025 A+ LYRICS. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
            <Link href="/auth/register" className="hover:text-slate-400 transition-colors">Sign Up</Link>
            <Link href="/auth/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
          </div>
          <span>Powered by Flutterwave 🇳🇬</span>
        </div>
      </footer>
    </div>
  )
}
