// src/components/three/shared/CrypticEye.tsx
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  createRadialGradient,
  createIrisTexture,
} from '../../../lib/three/proceduralTextures'

export default function CrypticEye({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const irisRef = useRef<THREE.Mesh>(null)
  const pupilRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)

  const glowTexture = useMemo(() => createRadialGradient('#10b981', 256), [])
  const irisTexture = useMemo(() => createIrisTexture(512), [])

  useFrame((state) => {
    /* eslint-disable react-hooks/immutability */
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.03
    }
    if (irisRef.current) {
      const pulse = 1 + Math.sin(t * 2.0) * 0.035
      irisRef.current.scale.setScalar(pulse)
    }
    if (pupilRef.current) {
      const dilate = 1 + Math.sin(t * 1.5) * 0.12
      pupilRef.current.scale.setScalar(dilate)
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.35
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.25
    }
    /* eslint-enable react-hooks/immutability */
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Soft glow halo — behind */}
      <sprite scale={[2.6, 2.6, 1]} position={[0, 0, -0.3]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.35}
        />
      </sprite>

      {/* Sclera — SMALLER sphere so no big crescent */}
      <mesh>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial
          color="#0d1a2a"
          roughness={0.6}
          metalness={0.3}
          emissive="#0a1522"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Iris — textured disc, in front of small sclera */}
      <mesh ref={irisRef} position={[0, 0, 0.55]}>
        <circleGeometry args={[0.58, 64]} />
        <meshStandardMaterial
          map={irisTexture}
          emissive="#10b981"
          emissiveMap={irisTexture}
          emissiveIntensity={0.7}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      {/* Iris outer edge glow ring — subtle */}
      <mesh position={[0, 0, 0.56]}>
        <ringGeometry args={[0.56, 0.585, 64]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={1.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Pupil */}
      <mesh ref={pupilRef} position={[0, 0, 0.57]}>
        <circleGeometry args={[0.14, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Highlight 1 — bigger, top right */}
      <mesh position={[0.07, 0.07, 0.58]}>
        <circleGeometry args={[0.035, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>

      {/* Highlight 2 — smaller, bottom left */}
      <mesh position={[-0.05, -0.04, 0.58]}>
        <circleGeometry args={[0.018, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>

      {/* Aperture ring 1 (outer) — thinner, lower opacity */}
      <mesh ref={ring1Ref} position={[0, 0, 0.5]}>
        <ringGeometry args={[0.72, 0.73, 96]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={1.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Aperture ring 2 (inner) — thinner */}
      <mesh ref={ring2Ref} position={[0, 0, 0.51]}>
        <ringGeometry args={[0.65, 0.655, 96]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={1.2}
          side={THREE.DoubleSide}
          transparent
          opacity={0.28}
        />
      </mesh>
    </group>
  )
}
