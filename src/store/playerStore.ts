import { create } from 'zustand'
import type { Track, SearchResult, LyricLine, PlayerState, SearchState, LyricsState } from '@/types/music'
import type { BeatState } from '@/types/beat'
import { DEFAULT_BEAT_STATE } from '@/types/beat'

interface PlayerStore {
  player: PlayerState
  search: SearchState
  lyrics: LyricsState
  beat: BeatState

  setTrack: (track: Track) => void
  setStatus: (status: PlayerState['status']) => void
  setPlayerTime: (currentTime: number, duration: number) => void
  setVolume: (volume: number) => void
  setBeat: (beat: Partial<BeatState>) => void

  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[], isLoading?: boolean) => void
  setSearchLoading: (isLoading: boolean) => void
  setSearchError: (error: string | null) => void

  setLyrics: (lines: LyricLine[], rawText: string) => void
  setActiveLyricLine: (index: number) => void
  setLyricsLoading: (isLoading: boolean) => void
  setLyricsError: (error: string | null) => void

  reset: () => void
}

const initialPlayer: PlayerState = {
  status: 'idle',
  source: null,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
}

const initialSearch: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  error: null,
}

const initialLyrics: LyricsState = {
  lines: [],
  activeLineIndex: -1,
  rawText: null,
  isLoading: false,
  error: null,
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: initialPlayer,
  search: initialSearch,
  lyrics: initialLyrics,
  beat: DEFAULT_BEAT_STATE,

  setTrack: (track) =>
    set((s) => ({
      player: { ...s.player, currentTrack: track, status: 'loading', currentTime: 0, duration: 0 },
    })),

  setStatus: (status) =>
    set((s) => ({ player: { ...s.player, status } })),

  setPlayerTime: (currentTime, duration) =>
    set((s) => ({ player: { ...s.player, currentTime, duration } })),

  setVolume: (volume) =>
    set((s) => ({ player: { ...s.player, volume } })),

  setBeat: (beat) =>
    set((s) => ({ beat: { ...s.beat, ...beat } })),

  setSearchQuery: (query) =>
    set((s) => ({ search: { ...s.search, query } })),

  setSearchResults: (results, isLoading = false) =>
    set((s) => ({ search: { ...s.search, results, isLoading, error: null } })),

  setSearchLoading: (isLoading) =>
    set((s) => ({ search: { ...s.search, isLoading } })),

  setSearchError: (error) =>
    set((s) => ({ search: { ...s.search, error, isLoading: false } })),

  setLyrics: (lines, rawText) =>
    set((s) => ({
      lyrics: { ...s.lyrics, lines, rawText, isLoading: false, error: null, activeLineIndex: -1 },
    })),

  setActiveLyricLine: (index) =>
    set((s) => ({ lyrics: { ...s.lyrics, activeLineIndex: index } })),

  setLyricsLoading: (isLoading) =>
    set((s) => ({ lyrics: { ...s.lyrics, isLoading } })),

  setLyricsError: (error) =>
    set((s) => ({ lyrics: { ...s.lyrics, error, isLoading: false } })),

  reset: () =>
    set({
      player: initialPlayer,
      lyrics: initialLyrics,
      beat: DEFAULT_BEAT_STATE,
    }),
}))
