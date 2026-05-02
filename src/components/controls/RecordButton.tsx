'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudioEngine'

interface Props {
  audioEngine: ReturnType<typeof useAudioEngine>
}

export default function RecordButton({ audioEngine }: Props) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const track = usePlayerStore((s) => s.player.currentTrack)

  const startRecording = async () => {
    setError(null)
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 } as MediaTrackConstraints,
        audio: false,
      })

      // Capture audio from the audio element (Chrome/Firefox)
      const audio = audioEngine.audioRef.current
      if (audio) {
        try {
          type CaptureStreamAudio = HTMLAudioElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }
          const el = audio as CaptureStreamAudio
          const audioStream = el.captureStream?.() ?? el.mozCaptureStream?.()
          audioStream?.getAudioTracks().forEach(t => displayStream.addTrack(t))
        } catch {
          // audio capture not supported — video-only recording
        }
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : ''

      const recorder = new MediaRecorder(displayStream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${track?.title ?? 'lyrics-video'}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 5000)
        displayStream.getTracks().forEach(t => t.stop())
      }

      // If user stops screen share via browser UI, stop the recorder too
      displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (recorderRef.current?.state === 'recording') {
          recorderRef.current.stop()
          setRecording(false)
          recorderRef.current = null
        }
      })

      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('Permission denied') && !msg.includes('NotAllowedError')) {
        setError('Recording not supported in this browser')
        setTimeout(() => setError(null), 4000)
      }
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    setRecording(false)
    recorderRef.current = null
  }

  if (!track) return null

  return (
    <div className="relative">
      <motion.button
        onClick={recording ? stopRecording : () => void startRecording()}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        title={recording ? 'Stop recording and download video' : 'Record stage as video and download'}
        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-2xl text-sm font-semibold transition-all border shrink-0"
        style={{
          background: recording ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.05)',
          borderColor: recording ? '#EF4444' : 'rgba(255,255,255,0.12)',
          color: recording ? '#EF4444' : '#94a3b8',
          boxShadow: recording ? '0 0 16px rgba(239,68,68,0.25)' : 'none',
        }}
      >
        {recording ? (
          <>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >⏹</motion.span>
            <span className="hidden sm:inline">Stop & Save</span>
          </>
        ) : (
          <>
            <span>⏺</span>
            <span className="hidden sm:inline">Record</span>
          </>
        )}
      </motion.button>

      {error && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-3 py-1.5 rounded-xl font-medium"
          style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
