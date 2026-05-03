import { create } from 'zustand'
import type { Track, SearchResult, LyricLine, PlayerState, SearchState, LyricsState, SearchSource, SpotifyState } from '@/types/music'
import type { BeatState } from '@/types/beat'
import { DEFAULT_BEAT_STATE } from '@/types/beat'

interface PlayerStore {
  player: PlayerState
  search: SearchState
  lyrics: LyricsState
  beat: BeatState
  spotify: SpotifyState

  setTrack: (track: Track, source?: PlayerState['source']) => void
  setStatus: (status: PlayerState['status']) => void
  setPlayerTime: (currentTime: number, duration: number) => void
  setVolume: (volume: number) => void
  setBeat: (beat: Partial<BeatState>) => void

  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[], isLoading?: boolean) => void
  setSearchLoading: (isLoading: boolean) => void
  setSearchError: (error: string | null) => void
  setSearchSource: (source: SearchSource) => void

  setSpotifyState: (state: Partial<SpotifyState>) => void

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
  source: 'audius',
}

const initialSpotify: SpotifyState = {
  connected: false,
  premium: null,
  deviceId: null,
  accessToken: null,
  expiresAt: 0,
  userName: null,
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
  spotify: initialSpotify,

  setTrack: (track, source) =>
    set((s) => ({
      player: { ...s.player, currentTrack: track, source: source ?? s.player.source, status: 'loading', currentTime: 0, duration: 0 },
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

  setSearchSource: (source) =>
    set((s) => ({ search: { ...s.search, source, results: [] } })),

  setSpotifyState: (state) =>
    set((s) => ({ spotify: { ...s.spotify, ...state } })),

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
