export const GRID_SIZE = 20
export const TOTAL_PIXELS = GRID_SIZE * GRID_SIZE
export const PIXEL_SIZE = 0.16
export const PIXEL_GAP = 0.03
export const SPACING = PIXEL_SIZE + PIXEL_GAP
export const HIGHLIGHTED_COUNT = 30
export const BINARY_COUNT = 40

export interface PixelData {
  index: number
  row: number
  col: number
  x: number
  y: number
  isHighlighted: boolean
}

export interface BinaryData {
  id: number
  char: '0' | '1'
  startX: number
  startY: number
  startZ: number
  targetX: number
  targetY: number
  targetZ: number
  exitX: number
  exitY: number
  exitZ: number
  delay: number
}

export const ALL_PIXELS: PixelData[] = (() => {
  let seed = 49281
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const halfGrid = (GRID_SIZE - 1) / 2
  const pixels: PixelData[] = []
  const allIndices: number[] = []
  for (let i = 0; i < TOTAL_PIXELS; i++) allIndices.push(i)
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = allIndices[i]
    allIndices[i] = allIndices[j]
    allIndices[j] = tmp
  }
  const highlightedSet = new Set(allIndices.slice(0, HIGHLIGHTED_COUNT))
  for (let i = 0; i < TOTAL_PIXELS; i++) {
    const row = Math.floor(i / GRID_SIZE)
    const col = i % GRID_SIZE
    pixels.push({
      index: i, row, col,
      x: (col - halfGrid) * SPACING,
      y: (halfGrid - row) * SPACING,
      isHighlighted: highlightedSet.has(i),
    })
  }
  return pixels
})()

export const HIGHLIGHTED_PIXELS: PixelData[] = ALL_PIXELS.filter((p) => p.isHighlighted)

export const BINARY_PARTICLES: BinaryData[] = (() => {
  let seed = 73519
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const particles: BinaryData[] = []
  for (let i = 0; i < BINARY_COUNT; i++) {
    const target = HIGHLIGHTED_PIXELS[i]
    const startAngle = rand() * Math.PI * 2
    const startRadius = 3.2 + rand() * 0.6
    const startX = Math.cos(startAngle) * startRadius
    const startY = Math.sin(startAngle) * startRadius
    const startZ = rand() * 0.5 - 0.25
    const exitAngle = rand() * Math.PI * 2
    const exitRadius = 4.0 + rand() * 1.0
    const exitX = Math.cos(exitAngle) * exitRadius
    const exitY = Math.sin(exitAngle) * exitRadius
    const exitZ = rand() * 0.5 - 0.25
    particles.push({
      id: i, char: rand() > 0.5 ? '1' : '0',
      startX, startY, startZ,
      targetX: target.x, targetY: target.y, targetZ: 0.1,
      exitX, exitY, exitZ,
      delay: rand() * 0.3,
    })
  }
  return particles
})()
