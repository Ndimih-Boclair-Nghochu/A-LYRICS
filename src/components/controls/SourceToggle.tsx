'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'

interface Props {
  spotify: ReturnType<typeof useSpotifyPlayer>
}

export default function SourceToggle({ spotify }: Props) {
  const source = usePlayerStore((s) => s.search.source)
  const setSource = usePlayerStore((s) => s.setSearchSource)
  const sp = usePlayerStore((s) => s.spotify)

  // On mount, check if Spotify is connected
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/spotify/me')
        if (cancelled) return
        if (res.ok) {
          const data: { connected: boolean; premium: boolean; userName: string } = await res.json()
          usePlayerStore.getState().setSpotifyState({
            connected: data.connected,
            premium: data.premium,
            userName: data.userName,
          })
          if (data.connected && data.premium) {
            await spotify.connect()
          }
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [spotify])

  const handleSwitch = async (next: 'audius' | 'spotify') => {
    if (next === source) return
    if (next === 'spotify' && !sp.connected) {
      window.location.href = '/api/spotify/auth'
      return
    }
    if (next === 'spotify' && !sp.deviceId) {
      const ok = await spotify.connect()
      if (!ok) return
    }
    setSource(next)
  }

  const handleDisconnect = async () => {
    await fetch('/api/spotify/disconnect', { method: 'POST' })
    spotify.disconnect()
    setSource('audius')
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleSwitch('audius')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
          style={{
            background: source === 'audius' ? 'linear-gradient(135deg,#9B5DE5,#FF6B9D)' : 'transparent',
            color: source === 'audius' ? '#fff' : '#94a3b8',
          }}
        >
          Audius
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleSwitch('spotify')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          style={{
            background: source === 'spotify' ? '#1DB954' : 'transparent',
            color: source === 'spotify' ? '#fff' : '#94a3b8',
          }}
          title={sp.connected ? `Connected as ${sp.userName ?? 'Spotify'}` : 'Click to connect Spotify Premium'}
        >
          <span>♫</span>
          <span>Spotify</span>
          {sp.connected && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sp.premium ? '#fff' : '#FFB84D' }} />
          )}
        </motion.button>
      </div>

      {sp.connected && (
        <button
          onClick={() => void handleDisconnect()}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2"
          title="Disconnect Spotify"
        >
          ✕
        </button>
      )}
    </div>
  )
}
