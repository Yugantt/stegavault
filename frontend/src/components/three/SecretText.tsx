import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
function smoothstep(t: number): number { const c = t < 0 ? 0 : t > 1 ? 1 : t; return c * c * (3 - 2 * c) }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }
export default function SecretText({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<Group>(null)
  useFrame(() => {
    if (!groupRef.current) return
    if (scrollProgress < 0.20) { groupRef.current.visible = false; return }
    if (scrollProgress >= 0.20 && scrollProgress < 0.40) {
      groupRef.current.visible = true
      const raw = (scrollProgress - 0.20) / 0.20
      const t = smoothstep(raw)
      groupRef.current.position.set(lerp(3.5, 0, t), 0, lerp(1.0, 0.05, t))
      const s = Math.max(0.01, lerp(1.1, 0.05, t))
      groupRef.current.scale.set(s, s, s)
      groupRef.current.rotation.y = (1 - t) * 0.2
    } else if (scrollProgress >= 0.40 && scrollProgress < 0.80) {
      groupRef.current.visible = false
    } else {
      groupRef.current.visible = true
      const raw = (scrollProgress - 0.80) / 0.20
      const t = smoothstep(raw)
      groupRef.current.position.set(0, Math.sin(Date.now() * 0.002) * 0.03, lerp(0.05, 1.2, t))
      const s = lerp(0.08, 1.3, t)
      groupRef.current.scale.set(s, s, s)
      groupRef.current.rotation.y = 0
    }
  })
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Text position={[0, 0, -0.02]} fontSize={0.52} color="#00ff88" anchorX="center" anchorY="middle" letterSpacing={0.12} fillOpacity={0.4}>SECRET</Text>
      <Text position={[0, 0, 0]} fontSize={0.5} color="#00d9ff" anchorX="center" anchorY="middle" letterSpacing={0.12} fillOpacity={0.98}>SECRET</Text>
    </group>
  )
}
