'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useSearch } from '@/hooks/useSearch'
import { useLyrics } from '@/hooks/useLyrics'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'
import type { SearchResult } from '@/types/music'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
  spotify: ReturnType<typeof useSpotifyPlayer>
  onBeforePlay?: () => Promise<boolean>
}

export default function SearchBar({ audioEngine, spotify, onBeforePlay }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
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
    setHasSearched(false)
    setShowResults(true)
    void search(value)
  }

  const handleSearch = useCallback(async () => {
    if (!inputValue.trim()) return
    setShowResults(true)
    setHasSearched(true)
    await search(inputValue, true)
  }, [inputValue, search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSearch()
    }
    if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    }
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
      duration: Math.round((result.trackTimeMillis || 180000) / 1000),
      genre: result.primaryGenreName || '',
    }

    if (result.source === 'spotify' && result.spotifyUri) {
      setTrack(track, 'spotify')
      const ok = await spotify.playUri(result.spotifyUri)
      if (!ok) return
      void fetchLyrics(track.artist, track.title, track.duration || 180)
      return
    }

    setTrack(track, 'search')
    const audio = audioEngine.initAudio(track.previewUrl, 'search')
    await audio.play().catch(() => {})
    void fetchLyrics(track.artist, track.title, track.duration || 180)
  }

  const handleClear = () => {
    setInputValue('')
    setHasSearched(false)
    clearSearch()
    setShowResults(false)
    inputRef.current?.focus()
  }

  const showDropdown = showResults && (results.length > 0 || (hasSearched && !isLoading))

  useEffect(() => {
    if (showDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownRect({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
  }, [showDropdown])

  return (
    <div ref={containerRef} className="relative w-full flex gap-2">
      {/* Input wrapper */}
      <div className="relative flex items-center flex-1 min-w-0">
        <span className="absolute left-3 text-base select-none pointer-events-none">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => inputValue && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search songs or artists..."
          className="w-full pl-9 pr-8 py-3 rounded-2xl bg-slate-800/80 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all text-sm font-medium"
          style={{ backdropFilter: 'blur(12px)' }}
        />
        {isLoading && (
          <motion.span
            className="absolute right-8 text-neon-cyan text-sm"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          >⟳</motion.span>
        )}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 text-slate-500 hover:text-white transition-colors text-xl leading-none p-0.5"
            aria-label="Clear"
          >×</button>
        )}
      </div>

      {/* Search button */}
      <motion.button
        onClick={() => void handleSearch()}
        disabled={!inputValue.trim() || isLoading}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="shrink-0 px-4 py-3 rounded-2xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #FF6B9D, #9B5DE5)' }}
        aria-label="Search"
      >
        <span className="hidden sm:inline">Search</span>
        <span className="sm:hidden">▶</span>
      </motion.button>

      {/* Results dropdown — fixed so it escapes any overflow-hidden parent */}
      <AnimatePresence>
        {showDropdown && dropdownRect && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] rounded-2xl overflow-hidden border border-slate-600/50"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              background: 'rgba(18,18,42,0.97)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,93,229,0.2)',
              maxHeight: '55vh',
              overflowY: 'auto',
            }}
          >
            {results.length === 0 && hasSearched && !isLoading ? (
              <div className="px-4 py-6 text-center text-slate-500 text-sm">
                <div className="text-3xl mb-2">🎵</div>
                No results for &ldquo;{inputValue}&rdquo; — try a different search
              </div>
            ) : (
              results.slice(0, 8).map((r, i) => (
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
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
