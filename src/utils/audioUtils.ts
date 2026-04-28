export function calculateBandEnergy(data: Uint8Array, startBin: number, endBin: number): number {
  const slice = data.slice(startBin, endBin + 1)
  const sum = slice.reduce((a, b) => a + b, 0)
  return sum / (slice.length * 255)
}

export function detectBeat(
  currentEnergy: number,
  historicalAverage: number,
  threshold: number = 1.4
): boolean {
  return currentEnergy > historicalAverage * threshold
}

export function updateRollingAverage(current: number, newValue: number, smoothing: number = 0.92): number {
  return current * smoothing + newValue * (1 - smoothing)
}

export function estimateBpm(beatTimes: number[]): number {
  if (beatTimes.length < 2) return 120
  const intervals = []
  for (let i = 1; i < beatTimes.length; i++) {
    intervals.push(beatTimes[i] - beatTimes[i - 1])
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return Math.round(60000 / avgInterval)
}
