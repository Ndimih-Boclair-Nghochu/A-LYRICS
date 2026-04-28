'use client'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { formatTime } from '@/utils/lyricsParser'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
}

export default function PlayerControls({ audioEngine }: Props) {
  const { play, pause, seek, updateVolume } = audioEngine
  const status = usePlayerStore((s) => s.player.status)
  const currentTime = usePlayerStore((s) => s.player.currentTime)
  const duration = usePlayerStore((s) => s.player.duration)
  const volume = usePlayerStore((s) => s.player.volume)
  const track = usePlayerStore((s) => s.player.currentTrack)
  const beat = usePlayerStore((s) => s.beat)

  const isPlaying = status === 'playing'
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(ratio * duration)
  }

  if (!track) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-4 py-3"
      style={{
        background: 'rgba(12,12,30,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(155,93,229,0.25)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-2 rounded-full cursor-pointer relative group"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={handleSeek}
          >
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF6B9D, #9B5DE5, #00D2FF)',
                boxShadow: isPlaying ? '0 0 8px rgba(155,93,229,0.8)' : 'none',
              }}
              animate={isPlaying ? { boxShadow: [`0 0 6px rgba(155,93,229,0.6)`, `0 0 ${12 + beat.bassEnergy * 8}px rgba(0,210,255,0.8)`, `0 0 6px rgba(155,93,229,0.6)`] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            {/* Scrubber dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)`, boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
            />
          </div>
          <span className="text-slate-500 text-xs w-10 tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Track info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img
              src={track.artworkUrl}
              alt=""
              className="w-9 h-9 rounded-lg object-cover shrink-0"
              style={{ boxShadow: isPlaying ? '0 0 12px rgba(255,107,157,0.5)' : 'none' }}
            />
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{track.title}</p>
              <p className="text-slate-500 text-xs truncate">{track.artist}</p>
            </div>
          </div>

          {/* Play/Pause */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              onClick={() => void handlePlayPause()}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all relative"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D, #9B5DE5)',
                boxShadow: isPlaying ? '0 0 20px rgba(255,107,157,0.6), 0 0 40px rgba(155,93,229,0.3)' : '0 4px 12px rgba(0,0,0,0.4)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              animate={
                isPlaying
                  ? { boxShadow: ['0 0 15px rgba(255,107,157,0.4)', `0 0 ${20 + beat.bassEnergy * 20}px rgba(155,93,229,0.8)`, '0 0 15px rgba(255,107,157,0.4)'] }
                  : {}
              }
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span className="relative z-10">{isPlaying ? '⏸' : '▶'}</span>
            </motion.button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-slate-500 text-sm">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => updateVolume(Number(e.target.value))}
              className="w-20 accent-neon-purple cursor-pointer"
              style={{ accentColor: '#9B5DE5' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
