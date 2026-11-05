import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BoxGeometry, Color, Matrix4 } from 'three'
import type { InstancedMesh, MeshStandardMaterial } from 'three'
import { ALL_PIXELS, PIXEL_SIZE, TOTAL_PIXELS } from './gridConstants'
const boxGeometry = new BoxGeometry(PIXEL_SIZE, PIXEL_SIZE, 0.08)
const DARK_COLORS = (() => {
  let seed = 88213
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const colors: [number, number, number][] = []
  for (let i = 0; i < TOTAL_PIXELS; i++) {
    colors.push([0.03 + rand() * 0.04, 0.05 + rand() * 0.06, 0.12 + rand() * 0.15])
  }
  return colors
})()
const tempMatrix = new Matrix4()
const tempColor = new Color()
const highlightColor = new Color('#00ff88')
export default function PixelGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(() => ({ roughness: 0.6, metalness: 0.2 }), [])
  useFrame((_state) => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    if (scrollProgress < 0.35 || scrollProgress > 0.85) { mesh.visible = false; return }
    mesh.visible = true
    let groupOpacity = 1
    if (scrollProgress < 0.45) groupOpacity = (scrollProgress - 0.35) / 0.1
    else if (scrollProgress > 0.75) groupOpacity = 1 - (scrollProgress - 0.75) / 0.1
    groupOpacity = Math.max(0, Math.min(1, groupOpacity))
    const mat = mesh.material as MeshStandardMaterial
    mat.transparent = true; mat.opacity = groupOpacity
    const time = Date.now() * 0.001
    for (let i = 0; i < TOTAL_PIXELS; i++) {
      const pixel = ALL_PIXELS[i]
      let z = 0
      if (pixel.isHighlighted && scrollProgress >= 0.35 && scrollProgress < 0.60) {
        z = Math.sin(time * 3 + pixel.index * 0.5) * 0.03 + 0.04
      }
      tempMatrix.makeTranslation(pixel.x, pixel.y, z)
      mesh.setMatrixAt(i, tempMatrix)
      if (pixel.isHighlighted) {
        if (scrollProgress >= 0.35 && scrollProgress < 0.60) {
          tempColor.set(highlightColor).multiplyScalar(0.7 + Math.sin(time * 4 + pixel.index * 0.3) * 0.3)
        } else if (scrollProgress >= 0.60 && scrollProgress < 0.80) {
          const dimT = (scrollProgress - 0.60) / 0.20
          tempColor.set(highlightColor).multiplyScalar(1 - dimT * 0.7)
        } else { tempColor.set(highlightColor).multiplyScalar(0.3) }
      } else {
        const dc = DARK_COLORS[i]; tempColor.setRGB(dc[0], dc[1], dc[2])
      }
      mesh.setColorAt(i, tempColor)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })
  return (
    <group rotation={[-0.25, 0, 0]} position={[0, -0.1, 0]}>
      <instancedMesh ref={meshRef} args={[boxGeometry, undefined, TOTAL_PIXELS]} frustumCulled={false}>
        <meshStandardMaterial roughness={material.roughness} metalness={material.metalness} transparent />
      </instancedMesh>
    </group>
  )
}
