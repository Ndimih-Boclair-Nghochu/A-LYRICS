export const NEON = {
  pink: '#FF6B9D',
  cyan: '#00D2FF',
  gold: '#FFD700',
  purple: '#9B5DE5',
  green: '#00F5A0',
  orange: '#FF6B35',
  red: '#FF4757',
  blue: '#4169E1',
  yellow: '#FFE66D',
  magenta: '#FF00FF',
  lime: '#ADFF2F',
  teal: '#00CED1',
} as const

export const STAGE = {
  dark: '#0A0A1A',
  card: '#12122A',
  floor: '#1A0A2E',
  spotlight: '#2A1A4A',
} as const

export const CHARACTER_COLORS = {
  singer: {
    head: '#FFD700',
    body: '#8B5CF6',
    pants: '#6D28D9',
    shoes: '#FFD700',
    hair: '#FF4500',
    skin: '#FFD700',
    accent: '#FF6B9D',
  },
  dancerA: {
    head: '#FF6B9D',
    body: '#00F5A0',
    pants: '#00BF77',
    shoes: '#FF6B35',
    hair: '#8B4513',
    skin: '#FF9999',
    accent: '#FFD700',
  },
  dancerB: {
    head: '#00D2FF',
    body: '#FF6B35',
    pants: '#CC4400',
    shoes: '#FFD700',
    hair: '#333',
    skin: '#7FDBFF',
    accent: '#9B5DE5',
  },
} as const

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const LYRIC_COLORS = [
  '#FF6B9D', '#00D2FF', '#FFD700', '#9B5DE5', '#00F5A0',
  '#FF6B35', '#FF4757', '#4169E1', '#FFE66D', '#00CED1',
]
