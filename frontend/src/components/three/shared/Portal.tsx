import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface PortalProps {
  position?: [number, number, number]
  radius?: number
  intensity?: number
}

export default function Portal({
  position = [0, 0, 0],
  radius = 2,
  intensity = 1,
}: PortalProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // 6 receding tunnel rings
  const ringData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        z: -i * 0.7,
        scale: 1 - i * 0.12,
        opacity: 0.9 - i * 0.13,
        color: i % 2 === 0 ? '#10b981' : '#00d9ff',
      })),
    [],
  )

  // Particles spiraling into tunnel
  const particleData = useMemo(() => {
    const count = 80
    const positions = new Float32Array(count * 3)
    const data: Array<{
      angle: number
      rad: number
      z: number
      speed: number
    }> = []
    let seed = 555
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2
      const rad = 0.8 + rand() * 1.2
      const z = -rand() * 4
      const speed = 0.4 + rand() * 0.8
      data.push({ angle, rad, z, speed })
      positions[i * 3] = Math.cos(angle) * rad
      positions[i * 3 + 1] = Math.sin(angle) * rad
      positions[i * 3 + 2] = z
    }
    return { positions, data, count }
  }, [])

  useFrame((state) => {
    /* eslint-disable react-hooks/immutability */
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.05
      groupRef.current.scale.setScalar(pulse)
    }

    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        const dir = i % 2 === 0 ? 1 : -1
        child.rotation.z = t * 0.4 * dir
      })
    }

    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes
        .position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      particleData.data.forEach((p, i) => {
        // Spiral inward toward center
        p.angle += p.speed * 0.04
        p.rad -= 0.008
        p.z += 0.015
        if (p.rad < 0.2 || p.z > 0) {
          p.rad = 1.2 + Math.random() * 0.8
          p.z = -4 - Math.random() * 2
          p.angle = Math.random() * Math.PI * 2
        }
        arr[i * 3] = Math.cos(p.angle) * p.rad
        arr[i * 3 + 1] = Math.sin(p.angle) * p.rad
        arr[i * 3 + 2] = p.z
      })
      posAttr.needsUpdate = true
    }

    if (coreMatRef.current) {
      coreMatRef.current.opacity =
        (0.5 + Math.sin(t * 2) * 0.3) * intensity
    }
    /* eslint-enable react-hooks/immutability */
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Tunnel rings — receding into z for real 3D depth */}
      <group ref={ringsRef}>
        {ringData.map((ring, i) => (
          <mesh key={i} position={[0, 0, ring.z]} scale={ring.scale}>
            <torusGeometry args={[radius, 0.04, 8, 96]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={ring.opacity}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Outer bright ring */}
      <mesh>
        <torusGeometry args={[radius, 0.08, 16, 128]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={3 * intensity}
          toneMapped={false}
        />
      </mesh>

      {/* Secondary cyan ring */}
      <mesh scale={1.05}>
        <torusGeometry args={[radius, 0.02, 12, 128]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2 * intensity}
          toneMapped={false}
        />
      </mesh>

      {/* Energy particles spiraling inward */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions.slice(), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#10b981"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Deep core glow at tunnel end */}
      <mesh position={[0, 0, -4]}>
        <circleGeometry args={[radius * 0.35, 32]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color="#10b981"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner brightness disc */}
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[radius * 0.85, 48]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.15 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
