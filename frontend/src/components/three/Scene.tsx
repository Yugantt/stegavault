import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points } from 'three'
import BinaryStreams from './BinaryStreams'
import CameraRig from './CameraRig'
import HeroImage from './HeroImage'
import PixelGrid from './PixelGrid'
import SecretText from './SecretText'
const PARTICLE_COUNT = 90
const PARTICLE_POSITIONS = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3)
  let seed = 3819
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] = (rand() - 0.5) * 14; pos[i * 3 + 1] = (rand() - 0.5) * 10; pos[i * 3 + 2] = -1.5 - rand() * 4
  }
  return pos
})()
function AmbientParticles() {
  const pointsRef = useRef<Points>(null)
  useFrame((_state, delta) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y += delta * 0.03; pointsRef.current.rotation.x += delta * 0.015
  })
  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[PARTICLE_POSITIONS, 3]} /></bufferGeometry>
      <pointsMaterial size={0.035} color="#8892a8" transparent opacity={0.35} />
    </points>
  )
}
export default function Scene({ scrollProgress }: { scrollProgress: number }) {
  const isDataStage = scrollProgress >= 0.35 && scrollProgress <= 0.85
  return (
    <>
      <CameraRig scrollProgress={scrollProgress} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 5]} intensity={1.4} />
      <pointLight position={[0, 0, 3]} intensity={isDataStage ? 2.5 : 0.9} color={isDataStage ? '#00ff88' : '#00d9ff'} distance={10} />
      <AmbientParticles />
      <PixelGrid scrollProgress={scrollProgress} />
      <BinaryStreams scrollProgress={scrollProgress} />
      <SecretText scrollProgress={scrollProgress} />
      <HeroImage scrollProgress={scrollProgress} />
    </>
  )
}
