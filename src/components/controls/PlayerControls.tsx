'use client'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import { formatTime } from '@/utils/lyricsParser'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
  spotify: ReturnType<typeof useSpotifyPlayer>
}

export default function PlayerControls({ audioEngine, spotify }: Props) {
  const { play, pause: audioPause, seek: audioSeek, updateVolume } = audioEngine
  const status = usePlayerStore((s) => s.player.status)
  const currentTime = usePlayerStore((s) => s.player.currentTime)
  const duration = usePlayerStore((s) => s.player.duration)
  const volume = usePlayerStore((s) => s.player.volume)
  const track = usePlayerStore((s) => s.player.currentTrack)
  const source = usePlayerStore((s) => s.player.source)
  const beat = usePlayerStore((s) => s.beat)
  const spError = usePlayerStore((s) => s.spotify.error)

  const isPlaying = status === 'playing'
  const isSpotify = source === 'spotify'
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handlePlayPause = async () => {
    if (isSpotify) {
      if (isPlaying) await spotify.pause()
      else await spotify.resume()
    } else {
      if (isPlaying) audioPause()
      else await play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const seconds = ratio * duration
    if (isSpotify) void spotify.seek(seconds)
    else audioSeek(seconds)
  }

  const cycleVolume = () => {
    const levels = [1, 0.5, 0]
    const next = levels.find(l => l < volume) ?? 1
    updateVolume(next)
    if (isSpotify) void spotify.setVolume(next)
  }

  if (!track) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-3 sm:px-4 py-2 sm:py-3"
      style={{
        background: 'rgba(12,12,30,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(155,93,229,0.25)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Spotify error / warning */}
        {isSpotify && spError && (
          <p className="text-xs text-amber-400 text-center font-medium px-2">{spError}</p>
        )}
        {isSpotify && (
          <p className="text-xs text-slate-500 text-center">
            ♫ Playing via Spotify · beat detection &amp; recording unavailable
          </p>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-slate-500 text-xs w-9 sm:w-10 text-right tabular-nums shrink-0">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 relative group cursor-pointer"
            style={{ height: '20px', display: 'flex', alignItems: 'center' }}
            onClick={handleSeek}
            onTouchStart={handleSeek}
          >
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: isSpotify
                    ? 'linear-gradient(90deg,#1DB954,#00D2FF)'
                    : 'linear-gradient(90deg, #FF6B9D, #9B5DE5, #00D2FF)',
                  boxShadow: isPlaying && !isSpotify ? '0 0 8px rgba(155,93,229,0.8)' : 'none',
                }}
                animate={isPlaying && !isSpotify ? { boxShadow: [`0 0 6px rgba(155,93,229,0.6)`, `0 0 ${12 + beat.bassEnergy * 8}px rgba(0,210,255,0.8)`, `0 0 6px rgba(155,93,229,0.6)`] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 8px)`, boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
            />
          </div>
          <span className="text-slate-500 text-xs w-9 sm:w-10 tabular-nums shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Track info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {track.artworkUrl ? (
              <img
                src={track.artworkUrl}
                alt=""
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0"
                style={{ boxShadow: isPlaying ? '0 0 12px rgba(255,107,157,0.5)' : 'none' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0 flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}>🎵</div>
            )}
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{track.title}</p>
              <p className="text-slate-500 text-xs truncate">
                {isSpotify && <span className="text-[#1DB954] mr-1">♫</span>}
                {track.artist}
              </p>
            </div>
          </div>

          {/* Play/Pause */}
          <motion.button
            onClick={() => void handlePlayPause()}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl font-bold relative shrink-0"
            style={{
              background: isSpotify
                ? (isPlaying ? '#1DB954' : 'rgba(29,185,84,0.7)')
                : 'linear-gradient(135deg, #FF6B9D, #9B5DE5)',
              boxShadow: isPlaying ? '0 0 20px rgba(255,107,157,0.6), 0 0 40px rgba(155,93,229,0.3)' : '0 4px 12px rgba(0,0,0,0.4)',
            }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            animate={isPlaying && !isSpotify ? { boxShadow: ['0 0 15px rgba(255,107,157,0.4)', `0 0 ${20 + beat.bassEnergy * 20}px rgba(155,93,229,0.8)`, '0 0 15px rgba(255,107,157,0.4)'] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="relative z-10">{isPlaying ? '⏸' : '▶'}</span>
          </motion.button>

          {/* Volume */}
          <div className="flex items-center gap-1 sm:gap-2 justify-end shrink-0">
            <button
              onClick={cycleVolume}
              className="text-slate-400 hover:text-white transition-colors p-1 text-base leading-none"
              aria-label="Volume"
            >
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                updateVolume(v)
                if (isSpotify) void spotify.setVolume(v)
              }}
              className="hidden sm:block w-20 cursor-pointer"
              style={{ accentColor: isSpotify ? '#1DB954' : '#9B5DE5' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

