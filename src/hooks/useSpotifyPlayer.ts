'use client'
import { useCallback, useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (event: string, cb: (data: unknown) => void) => boolean
  removeListener: (event: string) => boolean
  togglePlay: () => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  getCurrentState: () => Promise<unknown>
}

interface SpotifyPlayerCtor {
  new (options: {
    name: string
    getOAuthToken: (cb: (token: string) => void) => void
    volume?: number
  }): SpotifyPlayerInstance
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void
    Spotify?: { Player: SpotifyPlayerCtor }
  }
}

interface SDKReadyEvent { device_id: string }
interface SDKStateEvent {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: {
      id: string
      name: string
      uri: string
      duration_ms: number
      artists: { name: string }[]
      album: { name: string; images: { url: string }[] }
    } | null
  }
}

let sdkLoadPromise: Promise<void> | null = null

function loadSdkScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.Spotify) return Promise.resolve()
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('spotify-web-playback-sdk') as HTMLScriptElement | null
    const onReady = () => resolve()
    if (existing) {
      if (window.Spotify) return resolve()
      window.onSpotifyWebPlaybackSDKReady = onReady
      return
    }

    const script = document.createElement('script')
    script.id = 'spotify-web-playback-sdk'
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'))
    window.onSpotifyWebPlaybackSDKReady = onReady
    document.body.appendChild(script)
  })

  return sdkLoadPromise
}

export function useSpotifyPlayer() {
  const playerRef = useRef<SpotifyPlayerInstance | null>(null)
  const tokenRef = useRef<string | null>(null)
  const tokenExpiresRef = useRef<number>(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setSpotifyState = usePlayerStore((s) => s.setSpotifyState)
  const setStatus = usePlayerStore((s) => s.setStatus)
  const setPlayerTime = usePlayerStore((s) => s.setPlayerTime)

  const fetchToken = useCallback(async (): Promise<string | null> => {
    if (tokenRef.current && Date.now() < tokenExpiresRef.current - 30_000) {
      return tokenRef.current
    }
    try {
      const res = await fetch('/api/spotify/token')
      if (!res.ok) return null
      const data: { accessToken: string; expiresAt: number } = await res.json()
      tokenRef.current = data.accessToken
      tokenExpiresRef.current = data.expiresAt
      setSpotifyState({ accessToken: data.accessToken, expiresAt: data.expiresAt })
      return data.accessToken
    } catch {
      return null
    }
  }, [setSpotifyState])

  const connect = useCallback(async (): Promise<boolean> => {
    try {
      const token = await fetchToken()
      if (!token) {
        setSpotifyState({ connected: false, error: 'Connect Spotify to use this source' })
        return false
      }

      const meRes = await fetch('/api/spotify/me')
      if (meRes.ok) {
        const me: { connected: boolean; premium: boolean; userName: string } = await meRes.json()
        setSpotifyState({ connected: true, premium: me.premium, userName: me.userName, error: me.premium ? null : 'Spotify Premium is required for in-app playback' })
        if (!me.premium) return false
      }

      await loadSdkScript()

      if (!window.Spotify) {
        setSpotifyState({ error: 'Spotify SDK failed to load' })
        return false
      }

      const player = new window.Spotify.Player({
        name: 'A+ LYRICS',
        getOAuthToken: (cb) => {
          void fetchToken().then((t) => t && cb(t))
        },
        volume: usePlayerStore.getState().player.volume,
      })

      player.addListener('ready', (data) => {
        const { device_id } = data as SDKReadyEvent
        setSpotifyState({ connected: true, deviceId: device_id, error: null })
      })

      player.addListener('not_ready', () => {
        setSpotifyState({ deviceId: null })
      })

      player.addListener('player_state_changed', (state) => {
        if (!state) return
        const s = state as SDKStateEvent
        const cur = s.track_window.current_track
        if (cur) {
          usePlayerStore.getState().setTrack({
            id: cur.id,
            title: cur.name,
            artist: cur.artists.map((a) => a.name).join(', '),
            album: cur.album.name,
            previewUrl: '',
            artworkUrl: cur.album.images[0]?.url ?? '',
            duration: Math.round(cur.duration_ms / 1000),
            genre: '',
          }, 'spotify')
        }
        setStatus(s.paused ? 'paused' : 'playing')
        setPlayerTime(s.position / 1000, s.duration / 1000)
      })

      player.addListener('initialization_error', (e) => {
        setSpotifyState({ error: `Init error: ${(e as { message?: string }).message ?? 'unknown'}` })
      })
      player.addListener('authentication_error', () => {
        setSpotifyState({ error: 'Spotify auth failed — please reconnect', connected: false })
      })
      player.addListener('account_error', () => {
        setSpotifyState({ error: 'Spotify Premium is required for in-app playback', premium: false })
      })

      const ok = await player.connect()
      if (!ok) {
        setSpotifyState({ error: 'Could not connect Spotify player' })
        return false
      }

      playerRef.current = player

      // Poll for position updates while playing
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(() => {
        void player.getCurrentState().then((state) => {
          if (state) {
            const s = state as SDKStateEvent
            setPlayerTime(s.position / 1000, s.duration / 1000)
          }
        })
      }, 500)

      return true
    } catch (err) {
      setSpotifyState({ error: err instanceof Error ? err.message : 'Spotify connect failed' })
      return false
    }
  }, [fetchToken, setSpotifyState, setStatus, setPlayerTime])

  const playUri = useCallback(
    async (uri: string): Promise<boolean> => {
      const token = await fetchToken()
      const deviceId = usePlayerStore.getState().spotify.deviceId
      if (!token || !deviceId) {
        setSpotifyState({ error: 'Spotify player not ready' })
        return false
      }
      try {
        const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        })
        if (!res.ok && res.status !== 204) {
          if (res.status === 403) {
            setSpotifyState({ error: 'Spotify Premium is required for playback', premium: false })
          } else {
            setSpotifyState({ error: `Playback failed (${res.status})` })
          }
          return false
        }
        return true
      } catch {
        setSpotifyState({ error: 'Network error during playback' })
        return false
      }
    },
    [fetchToken, setSpotifyState]
  )

  const pause = useCallback(async () => {
    await playerRef.current?.pause()
  }, [])

  const resume = useCallback(async () => {
    await playerRef.current?.resume()
  }, [])

  const seek = useCallback(async (seconds: number) => {
    await playerRef.current?.seek(seconds * 1000)
  }, [])

  const setVolume = useCallback(async (vol: number) => {
    await playerRef.current?.setVolume(vol)
  }, [])

  const disconnect = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    playerRef.current?.disconnect()
    playerRef.current = null
    setSpotifyState({ connected: false, deviceId: null, accessToken: null, expiresAt: 0 })
  }, [setSpotifyState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      playerRef.current?.disconnect()
    }
  }, [])

  return { connect, disconnect, playUri, pause, resume, seek, setVolume, fetchToken }
}
