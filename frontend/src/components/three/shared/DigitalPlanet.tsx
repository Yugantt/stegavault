// src/components/three/shared/DigitalPlanet.tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface DigitalPlanetProps {
  radius?: number
}

export default function DigitalPlanet({ radius = 1.4 }: DigitalPlanetProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18
    }
  })

  return (
    <group ref={groupRef}>
      {/* Wireframe core */}
      <mesh>
        <sphereGeometry args={[radius, 24, 16]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Subtle cyan inner glow */}
      <mesh>
        <sphereGeometry args={[radius * 0.98, 32, 32]} />
        <meshBasicMaterial color="#00d9ff" transparent opacity={0.06} />
      </mesh>

      {/* Atmosphere halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.1, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.03, 0.008, 8, 96]} />
        <meshBasicMaterial color="#00d9ff" />
      </mesh>

      {/* Tilted orbit ring */}
      <mesh rotation={[Math.PI / 2.6, 0.3, 0.4]}>
        <torusGeometry args={[radius * 1.25, 0.006, 8, 96]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
