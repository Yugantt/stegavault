import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { TextureLoader } from 'three'
import type { Mesh, MeshBasicMaterial, Texture } from 'three'
export default function HeroImage({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<Mesh>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    const loader = new TextureLoader()
    loader.load('/mountain.jpg', (tex) => setTexture(tex))
  }, [])
  useFrame((_state, _delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as MeshBasicMaterial
    if (scrollProgress <= 0.2) {
      meshRef.current.visible = true; mat.opacity = 1; meshRef.current.scale.setScalar(1)
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.02
    } else if (scrollProgress <= 0.4) {
      meshRef.current.visible = true
      const t = (scrollProgress - 0.2) / 0.2
      mat.opacity = 1 - t
      const s = 1 + t * 0.15
      meshRef.current.scale.set(s, s, 1)
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.02 * (1 - t)
    } else if (scrollProgress <= 0.8) {
      meshRef.current.visible = false; mat.opacity = 0
    } else {
      meshRef.current.visible = true
      const t = (scrollProgress - 0.8) / 0.2
      mat.opacity = t
      const s = 1.15 - t * 0.15
      meshRef.current.scale.set(s, s, 1)
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.02 * t
    }
  })
  if (!texture) return null
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4.8, 2.4]} />
      <meshBasicMaterial map={texture} transparent opacity={1} />
    </mesh>
  )
}
