'use client'
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { parseLyrics } from '@/utils/lyricsParser'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
  onBeforePlay?: () => Promise<boolean>
}

export default function UploadButton({ audioEngine, onBeforePlay }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const setTrack = usePlayerStore((s) => s.setTrack)
  const setLyrics = usePlayerStore((s) => s.setLyrics)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('audio/')) return

      if (onBeforePlay) {
        const allowed = await onBeforePlay()
        if (!allowed) return
      }

      const url = URL.createObjectURL(file)
      const name = file.name.replace(/\.[^/.]+$/, '')

      const track = {
        id: `upload-${Date.now()}`,
        title: name,
        artist: 'Uploaded Track',
        album: '',
        previewUrl: url,
        artworkUrl: '',
        duration: 0,
        genre: '',
      }
      setTrack(track)

      const placeholder = parseLyrics(
        `Now playing: ${name}\nUploaded track\nFeel the beat!\nA+ LYRICS\nDance to your music`,
        180
      )
      setLyrics(placeholder, '')

      const audio = audioEngine.initAudio(url, 'upload')
      await audio.play().catch(() => {})
    },
    [audioEngine, onBeforePlay, setTrack, setLyrics]
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
