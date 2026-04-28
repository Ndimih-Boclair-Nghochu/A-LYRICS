export type PlanId = 'FREE' | 'GROOVE' | 'STAR' | 'VIP'

export interface PlanConfig {
  id: PlanId
  name: string
  tagline: string
  priceNGN: number
  priceUSD: number
  songsPerMonth: number | null   // null = unlimited
  features: string[]
  color: string
  gradient: string
  emoji: string
  popular?: boolean
}

export const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free',
    tagline: 'Try it out',
    priceNGN: 0,
    priceUSD: 0,
    songsPerMonth: 1,
    features: [
      '1 song per month',
      'All animated stickers',
      'Beat-reactive stage',
      'Lyrics display',
      'Music upload',
    ],
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #334155, #475569)',
    emoji: '🎵',
  },
  {
    id: 'GROOVE',
    name: 'Groove',
    tagline: 'For music lovers',
    priceNGN: 3000,
    priceUSD: 3,
    songsPerMonth: 50,
    features: [
      '50 songs per month',
      'All animated stickers',
      'Beat-reactive stage',
      'Full lyrics with sync',
      'Music upload',
      'HD audio support',
      'Priority search',
    ],
    color: '#00D2FF',
    gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)',
    emoji: '🎶',
  },
  {
    id: 'STAR',
    name: 'Star',
    tagline: 'Most popular',
    priceNGN: 7000,
    priceUSD: 7,
    songsPerMonth: 200,
    features: [
      '200 songs per month',
      'Premium sticker packs',
      'Beat-reactive stage',
      'Full lyrics with sync',
      'Music upload',
      'HD audio + video',
      'Download lyrics (PDF)',
      'Custom sticker themes',
      'Email support',
    ],
    color: '#9B5DE5',
    gradient: 'linear-gradient(135deg, #7C3AED, #9B5DE5)',
    emoji: '⭐',
    popular: true,
  },
  {
    id: 'VIP',
    name: 'VIP',
    tagline: 'For power users',
    priceNGN: 15000,
    priceUSD: 15,
    songsPerMonth: null,
    features: [
      'Unlimited songs',
      'All premium stickers',
      'Beat-reactive stage',
      'Full lyrics with sync',
      'Music upload',
      'Ultra HD audio + video',
      'Download lyrics (PDF)',
      'All sticker themes',
      'Priority support',
      'Early access to features',
      'Custom profile badge',
    ],
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    emoji: '👑',
  },
]

export function getPlan(id: PlanId): PlanConfig {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

export function canPlaySong(plan: PlanId, songsPlayed: number): boolean {
  const config = getPlan(plan)
  if (config.songsPerMonth === null) return true
  return songsPlayed < config.songsPerMonth
}

export function remainingSongs(plan: PlanId, songsPlayed: number): number | null {
  const config = getPlan(plan)
  if (config.songsPerMonth === null) return null
  return Math.max(0, config.songsPerMonth - songsPlayed)
}
