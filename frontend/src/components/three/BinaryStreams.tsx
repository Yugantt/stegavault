import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { BINARY_PARTICLES } from './gridConstants'
function smoothstep(t: number): number { const c = t < 0 ? 0 : t > 1 ? 1 : t; return c * c * (3 - 2 * c) }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }
export default function BinaryStreams({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<Group>(null)
  useFrame(() => {
    if (!groupRef.current) return
    if (scrollProgress < 0.38 || scrollProgress > 0.82) { groupRef.current.visible = false; return }
    groupRef.current.visible = true
    for (let i = 0; i < BINARY_PARTICLES.length; i++) {
      const child = groupRef.current.children[i]
      if (!child) continue
      const p = BINARY_PARTICLES[i]
      if (scrollProgress >= 0.40 && scrollProgress < 0.60) {
        const raw = (scrollProgress - 0.40) / 0.20
        const staggered = Math.max(0, Math.min(1, (raw - p.delay) / (1 - p.delay)))
        const t = smoothstep(staggered)
        child.position.x = lerp(p.startX, p.targetX, t); child.position.y = lerp(p.startY, p.targetY, t); child.position.z = lerp(p.startZ, p.targetZ, t); child.visible = true
      } else if (scrollProgress >= 0.60 && scrollProgress < 0.80) {
        const raw = (scrollProgress - 0.60) / 0.20
        const staggered = Math.max(0, Math.min(1, (raw - p.delay) / (1 - p.delay)))
        const t = smoothstep(staggered)
        child.position.x = lerp(p.targetX, p.exitX, t); child.position.y = lerp(p.targetY, p.exitY, t); child.position.z = lerp(p.targetZ, p.exitZ, t); child.visible = true
      } else {
        if (scrollProgress < 0.40) { const t = (scrollProgress - 0.38) / 0.02; child.visible = t > 0; child.position.set(p.startX, p.startY, p.startZ) } 
        else { const t = (0.82 - scrollProgress) / 0.02; child.visible = t > 0; child.position.set(p.exitX, p.exitY, p.exitZ) }
      }
    }
  })
  return (
    <group rotation={[-0.25, 0, 0]} position={[0, -0.1, 0]}>
      <group ref={groupRef}>
        {BINARY_PARTICLES.map((p) => (
          <group key={p.id} position={[p.startX, p.startY, p.startZ]}>
            <Text fontSize={0.1} color="#00ff88" anchorX="center" anchorY="middle">{p.char}</Text>
          </group>
        ))}
      </group>
    </group>
  )
}
