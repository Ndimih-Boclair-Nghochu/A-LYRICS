'use client'
import { useRef, useCallback, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { calculateBandEnergy, detectBeat, updateRollingAverage, estimateBpm } from '@/utils/audioUtils'

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef<number>(0)
  const avgBassRef = useRef(0)
  const lastBeatTimeRef = useRef(0)
  const beatTimesRef = useRef<number[]>([])

  const setStatus = usePlayerStore((s) => s.setStatus)
  const setPlayerTime = usePlayerStore((s) => s.setPlayerTime)
  const setBeat = usePlayerStore((s) => s.setBeat)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const volume = usePlayerStore((s) => s.player.volume)

  const stopAnalysis = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const startAnalysis = useCallback(() => {
    const analyser = analyserRef.current
    const audio = audioRef.current
    if (!analyser || !audio) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const tick = () => {
      analyser.getByteFrequencyData(dataArray)

      const bass = calculateBandEnergy(dataArray, 0, 5)
      const mid = calculateBandEnergy(dataArray, 6, 20)
      const high = calculateBandEnergy(dataArray, 21, 50)

      avgBassRef.current = updateRollingAverage(avgBassRef.current, bass)

      const now = performance.now()
      const isBeat = detectBeat(bass, avgBassRef.current) && now - lastBeatTimeRef.current > 200

      if (isBeat) {
        lastBeatTimeRef.current = now
        beatTimesRef.current = [...beatTimesRef.current.slice(-8), now]
      }

      const bpm = estimateBpm(beatTimesRef.current)

      setBeat({
        intensity: bass,
        isBeat,
        bassEnergy: bass,
        midEnergy: mid,
        highEnergy: high,
        bpm: Math.max(60, Math.min(200, bpm)),
      })

      setPlayerTime(audio.currentTime, audio.duration || 0)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [setBeat, setPlayerTime])

  const initAudio = useCallback(
    (src: string, sourceType: 'search' | 'upload') => {
      stopAnalysis()

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }

      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.preload = 'auto'
      audio.volume = volume
      audioRef.current = audio

      const initContext = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext()
        }
        const ctx = audioContextRef.current

        if (sourceRef.current) sourceRef.current.disconnect()

        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        const source = ctx.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(ctx.destination)
        sourceRef.current = source
      }

      audio.addEventListener('canplay', initContext, { once: true })

      audio.addEventListener('play', () => {
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume()
        }
        setStatus('playing')
        startAnalysis()
      })

      audio.addEventListener('pause', () => {
        setStatus('paused')
        stopAnalysis()
        setBeat({ isBeat: false, intensity: 0, bassEnergy: 0, midEnergy: 0, highEnergy: 0 })
      })

      audio.addEventListener('ended', () => {
        setStatus('idle')
        stopAnalysis()
        setBeat({ isBeat: false, intensity: 0, bassEnergy: 0, midEnergy: 0, highEnergy: 0 })
      })

      audio.addEventListener('error', () => {
        setStatus('idle')
        stopAnalysis()
      })

      audio.src = src
      void usePlayerStore.getState().setStatus('loading')

      return audio
    },
    [volume, startAnalysis, stopAnalysis, setStatus, setBeat]
  )

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    await audio.play()
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const updateVolume = useCallback(
    (vol: number) => {
      if (audioRef.current) audioRef.current.volume = vol
      setVolume(vol)
    },
    [setVolume]
  )

  useEffect(() => {
    return () => {
      stopAnalysis()
      audioRef.current?.pause()
    }
  }, [stopAnalysis])

  return { audioRef, initAudio, play, pause, seek, updateVolume }
}
