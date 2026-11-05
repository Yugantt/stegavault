import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function createMountainLayer(
  size: number,
  amplitude: number,
  seed: number,
  segments: number,
) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments)
  geo.rotateX(-Math.PI / 2.2)
  const pos = geo.attributes.position

  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const distFromCenter = Math.abs(x)
    const peak =
      Math.sin(x * 0.1) * Math.cos(y * 0.1) * amplitude +
      Math.sin(x * 0.25 + seed) * Math.cos(y * 0.3) * (amplitude * 0.4) +
      rand() * 2
    const height =
      (distFromCenter > 8
        ? Math.pow(distFromCenter * 0.35, 1.6) * (amplitude / 8)
        : 0) + peak
    pos.setZ(i, height - 12)
  }
  geo.computeVertexNormals()
  return geo
}

export default function MountainTerrain() {
  const groupRef = useRef<THREE.Group>(null)

  const layers = useMemo(() => {
    return [
      {
        geo: createMountainLayer(160, 14, 111, 80),
        z: -55,
        color: '#0a1a2a',
        wireColor: '#059669',
        wireOpacity: 0.06,
        y: -8,
      },
      {
        geo: createMountainLayer(120, 10, 222, 64),
        z: -30,
        color: '#0b1420',
        wireColor: '#10b981',
        wireOpacity: 0.10,
        y: -6,
      },
      {
        geo: createMountainLayer(90, 7, 333, 48),
        z: -15,
        color: '#0d1a2a',
        wireColor: '#34d399',
        wireOpacity: 0.16,
        y: -4,
      },
    ]
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.02
  })

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <group key={i} position={[0, layer.y, layer.z]}>
          {/* Solid mountain */}
          <mesh geometry={layer.geo}>
            <meshStandardMaterial
              color={layer.color}
              roughness={0.85}
              metalness={0.15}
              flatShading
            />
          </mesh>
          {/* Wireframe overlay */}
          <mesh geometry={layer.geo} position={[0, 0.05, 0]}>
            <meshBasicMaterial
              color={layer.wireColor}
              wireframe
              transparent
              opacity={layer.wireOpacity}
            />
          </mesh>
        </group>
      ))}

      {/* Volumetric fog planes between layers */}
      <mesh position={[0, 2, -40]} rotation={[0, 0, 0]}>
        <planeGeometry args={[180, 40]} />
        <meshBasicMaterial
          color="#050807"
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1, -22]} rotation={[0, 0, 0]}>
        <planeGeometry args={[140, 30]} />
        <meshBasicMaterial
          color="#0a1520"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
