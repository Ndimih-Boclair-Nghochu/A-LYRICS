export interface BeatState {
  intensity: number
  isBeat: boolean
  bassEnergy: number
  midEnergy: number
  highEnergy: number
  bpm: number
}

export interface CharacterBeatProps {
  beat: BeatState
  isPlaying: boolean
}

export const DEFAULT_BEAT_STATE: BeatState = {
  intensity: 0,
  isBeat: false,
  bassEnergy: 0,
  midEnergy: 0,
  highEnergy: 0,
  bpm: 120,
}
