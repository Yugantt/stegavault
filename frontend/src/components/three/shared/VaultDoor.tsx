// src/components/three/shared/VaultDoor.tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface VaultDoorProps {
  progress: React.MutableRefObject<number>
}

const RIVET_COUNT = 24

export default function VaultDoor({ progress }: VaultDoorProps) {
  const leftRef = useRef<THREE.Group>(null)
  const rightRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Group>(null)
  const handleRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    /* eslint-disable react-hooks/immutability */
    const p = progress.current

    // Doors open from p=0.5 to 0.85
    const openT = Math.max(0, Math.min(1, (p - 0.5) / 0.35))
    const eased = openT * openT * (3 - 2 * openT)

    if (leftRef.current) {
      leftRef.current.position.x = -eased * 4
    }
    if (rightRef.current) {
      rightRef.current.position.x = eased * 4
    }

    // Concentric rings rotate
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.008 * (1 + eased * 3)
    }

    // Handle spins
    if (handleRef.current) {
      handleRef.current.rotation.z += 0.03 * (1 + eased * 4)
    }

    // Light intensity
    if (lightRef.current) {
      lightRef.current.intensity = eased * 20
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = eased * 0.95
    }
    /* eslint-enable react-hooks/immutability */
  })

  return (
    <group>
      {/* ===== OUTER FRAME ===== */}
      <mesh>
        <torusGeometry args={[3.8, 0.3, 16, 96]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Emerald accent ring */}
      <mesh position={[0, 0, 0.05]}>
        <torusGeometry args={[3.55, 0.04, 12, 96]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Rivets */}
      {Array.from({ length: RIVET_COUNT }).map((_, i) => {
        const angle = (i / RIVET_COUNT) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 3.4,
              Math.sin(angle) * 3.4,
              0.2,
            ]}
          >
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.6}
              metalness={0.9}
            />
          </mesh>
        )
      })}

      {/* ===== INNER GLOW (visible when open) ===== */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <circleGeometry args={[3.4, 64]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 0, -0.6]}
        color="#10b981"
        intensity={0}
        distance={20}
      />

      {/* ===== LEFT DOOR ===== */}
      <group ref={leftRef}>
        <mesh>
          <circleGeometry args={[3.4, 64, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#080808"
            metalness={0.95}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Left door concentric rings */}
        <mesh position={[-1.4, 0, 0.02]}>
          <ringGeometry args={[1.6, 1.7, 32, 1, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh position={[-0.8, 0, 0.02]}>
          <ringGeometry args={[1.0, 1.05, 32, 1, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* ===== RIGHT DOOR ===== */}
      <group ref={rightRef}>
        <mesh>
          <circleGeometry args={[3.4, 64, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#080808"
            metalness={0.95}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[1.4, 0, 0.02]}>
          <ringGeometry args={[1.6, 1.7, 32, 1, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh position={[0.8, 0, 0.02]}>
          <ringGeometry args={[1.0, 1.05, 32, 1, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* ===== CENTER HANDLE WHEEL ===== */}
      <group ref={handleRef} position={[0, 0, 0.25]}>
        <mesh>
          <torusGeometry args={[0.65, 0.08, 12, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.32,
                Math.sin(angle) * 0.32,
                0,
              ]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.65, 0.04, 0.04]} />
              <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.7}
              />
            </mesh>
          )
        })}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#00d9ff" />
        </mesh>
      </group>
    </group>
  )
}
