// src/components/three/shared/SnowParticles.tsx
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const RANGE = 22
const HEIGHT = 18

interface SnowParticlesProps {
  count?: number
  color?: string
  size?: number
}

export default function SnowParticles({
  count = 500,
  color = '#e8f5ef',
  size = 0.09,
}: SnowParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, speeds, originals } = useMemo(() => {
    let seed = 12345
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * RANGE
      pos[i * 3 + 1] = rand() * HEIGHT - HEIGHT / 2
      pos[i * 3 + 2] = (rand() - 0.5) * RANGE
      spd[i] = 0.4 + rand() * 1.4
    }
    return { positions: pos, speeds: spd, originals: pos.slice() }
  }, [count])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const attr = geo.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * delta
      arr[i * 3] += Math.sin(t * 0.8 + i * 0.7) * delta * 0.25

      if (arr[i * 3 + 1] < -HEIGHT / 2) {
        arr[i * 3 + 1] = HEIGHT / 2
        arr[i * 3] = originals[i * 3]
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
