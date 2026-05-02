'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useSearch } from '@/hooks/useSearch'
import { useLyrics } from '@/hooks/useLyrics'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import type { SearchResult } from '@/types/music'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
  onBeforePlay?: () => Promise<boolean>
}

export default function SearchBar({ audioEngine, onBeforePlay }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = usePlayerStore((s) => s.search.results)
  const isLoading = usePlayerStore((s) => s.search.isLoading)
  const setTrack = usePlayerStore((s) => s.setTrack)

  const { search, clearSearch } = useSearch()
  const { fetchLyrics } = useLyrics()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (value: string) => {
    setInputValue(value)
    setShowResults(true)
    void search(value)
  }

  const handleSelect = async (result: SearchResult) => {
    setShowResults(false)
    setInputValue(`${result.trackName} — ${result.artistName}`)
    clearSearch()

    if (onBeforePlay) {
      const allowed = await onBeforePlay()
      if (!allowed) return
    }

    const track = {
      id: String(result.trackId),
      title: result.trackName,
      artist: result.artistName,
      album: result.collectionName || '',
      previewUrl: result.previewUrl,
      artworkUrl: result.artworkUrl100?.replace('100x100', '300x300') || result.artworkUrl100 || '',
      duration: Math.round((result.trackTimeMillis || 30000) / 1000),
      genre: result.primaryGenreName || '',
    }

    setTrack(track)
    const audio = audioEngine.initAudio(track.previewUrl, 'search')
    await audio.play().catch(() => {})
    void fetchLyrics(track.artist, track.title, 30)
  }

  const handleClear = () => {
    setInputValue('')
    clearSearch()
    setShowResults(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative flex items-center">
        <span className="absolute left-3 sm:left-4 text-base sm:text-lg select-none pointer-events-none">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => inputValue && setShowResults(true)}
          placeholder="Search songs or artists..."
          className="w-full pl-9 sm:pl-11 pr-9 sm:pr-11 py-3 sm:py-3.5 rounded-2xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all text-sm font-medium"
          style={{ backdropFilter: 'blur(12px)' }}
        />
        {isLoading && (
          <motion.span
            className="absolute right-9 sm:right-10 text-neon-cyan text-sm"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >⟳</motion.span>
        )}
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-slate-500 hover:text-white transition-colors text-xl leading-none p-1"
          >×</button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl overflow-hidden border border-slate-600/50"
            style={{
              background: 'rgba(18,18,42,0.97)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,93,229,0.2)',
              maxHeight: '55vh',
              overflowY: 'auto',
            }}
          >
            {results.slice(0, 8).map((r, i) => (
              <motion.button
                key={r.trackId}
                onClick={() => void handleSelect(r)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/5 active:bg-white/10 transition-colors text-left group border-b border-slate-700/30 last:border-0"
              >
                <img
                  src={r.artworkUrl100}
                  alt=""
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231e1b4b'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='20'>🎵</text></svg>" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-neon-pink transition-colors">
                    {r.trackName}
                  </p>
                  <p className="text-slate-400 text-xs truncate">{r.artistName}</p>
                </div>
                <span className="text-slate-500 text-xs shrink-0 hidden sm:block group-hover:text-neon-cyan transition-colors">
                  {Math.floor((r.trackTimeMillis || 0) / 60000)}:{String(Math.floor(((r.trackTimeMillis || 0) % 60000) / 1000)).padStart(2, '0')}
                </span>
                <span className="text-neon-purple text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0">▶</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
