import type { LyricLine } from '@/types/music'

export function parseLyrics(rawText: string, duration: number = 30): LyricLine[] {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('[') && !l.startsWith('(') && l !== '...')

  if (lines.length === 0) return []

  const timePerLine = duration / lines.length

  return lines.map((text, index) => ({
    text,
    startTime: index * timePerLine,
    endTime: (index + 1) * timePerLine,
    index,
  }))
}

export function getActiveLineIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1

  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].startTime) {
      return i
    }
  }

  return 0
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
