'use client'
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useLyrics } from '@/hooks/useLyrics'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
  onBeforePlay?: () => Promise<boolean>
}

export default function UploadButton({ audioEngine, onBeforePlay }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const setTrack = usePlayerStore((s) => s.setTrack)
  const { fetchLyrics } = useLyrics()

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('audio/')) return

      if (onBeforePlay) {
        const allowed = await onBeforePlay()
        if (!allowed) return
      }

      const url = URL.createObjectURL(file)
      // Try to parse "Artist - Title" filename for better lyrics matching
      const name = file.name.replace(/\.[^/.]+$/, '')
      const dashSplit = name.split(/\s*[-–—]\s*/)
      const artist = dashSplit.length >= 2 ? dashSplit[0] : 'Uploaded Track'
      const title = dashSplit.length >= 2 ? dashSplit.slice(1).join(' - ') : name

      const track = {
        id: `upload-${Date.now()}`,
        title,
        artist,
        album: '',
        previewUrl: url,
        artworkUrl: '',
        duration: 0,
        genre: '',
      }
      setTrack(track)

      const audio = audioEngine.initAudio(url, 'upload')
      // Wait for metadata so we know the real duration, then fetch full-length lyrics
      audio.addEventListener('loadedmetadata', () => {
        const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 180
        void fetchLyrics(artist, title, dur)
      }, { once: true })
      await audio.play().catch(() => {})
    },
    [audioEngine, onBeforePlay, setTrack, fetchLyrics]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && void handleFile(e.target.files[0])}
      />
      <motion.button
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-2xl text-sm font-semibold transition-all border shrink-0"
        style={{
          background: dragOver ? 'rgba(0,210,255,0.15)' : 'rgba(255,255,255,0.05)',
          borderColor: dragOver ? '#00D2FF' : 'rgba(255,255,255,0.12)',
          color: dragOver ? '#00D2FF' : '#94a3b8',
          boxShadow: dragOver ? '0 0 16px rgba(0,210,255,0.3)' : 'none',
        }}
      >
        <span>📤</span>
        <span className="hidden sm:inline">Upload</span>
      </motion.button>
    </>
  )
}
