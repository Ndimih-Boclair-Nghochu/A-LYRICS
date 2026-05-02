'use client'
import { useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { parseLyrics } from '@/utils/lyricsParser'
import type { LyricLine } from '@/types/music'

function getFallbackLyrics(title: string, duration: number): LyricLine[] {
  const placeholders = [
    `Now playing: ${title}`,
    'Search for this song to see full lyrics',
    'Upload your own music to get started',
    'Lyrics not available for this track',
    'A+ LYRICS — Where Music Comes Alive',
    'Dance to the beat!',
    'Feel the rhythm',
    'Let the music flow',
  ]
  return parseLyrics(placeholders.join('\n'), duration)
}

export function useLyrics() {
  const setLyrics = usePlayerStore((s) => s.setLyrics)
  const setLoading = usePlayerStore((s) => s.setLyricsLoading)
  const setError = usePlayerStore((s) => s.setLyricsError)

  const fetchLyrics = useCallback(
    async (artist: string, title: string, duration: number = 180) => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
        )
        if (!res.ok) throw new Error('Lyrics not found')
        const data: { lyrics?: string } = await res.json()
        if (data.lyrics) {
          const lines = parseLyrics(data.lyrics, duration)
          setLyrics(lines, data.lyrics)
        } else {
          setLyrics(getFallbackLyrics(title, duration), '')
        }
      } catch {
        setLyrics(getFallbackLyrics(title, duration), '')
        setError(null)
      }
    },
    [setLyrics, setLoading, setError]
  )

  return { fetchLyrics }
}
