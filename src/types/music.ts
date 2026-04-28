export interface Track {
  id: string
  title: string
  artist: string
  album: string
  previewUrl: string
  artworkUrl: string
  duration: number
  genre: string
}

export interface SearchResult {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  previewUrl: string
  artworkUrl100: string
  trackTimeMillis: number
  primaryGenreName: string
}

export interface LyricLine {
  text: string
  startTime: number
  endTime: number
  index: number
}

export interface PlayerState {
  status: 'idle' | 'loading' | 'playing' | 'paused'
  source: 'search' | 'upload' | null
  currentTrack: Track | null
  currentTime: number
  duration: number
  volume: number
}

export interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
}

export interface LyricsState {
  lines: LyricLine[]
  activeLineIndex: number
  rawText: string | null
  isLoading: boolean
  error: string | null
}
