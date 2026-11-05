import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
function smoothstep(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t
  return c * c * (3 - 2 * c)
}
export default function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const introRef = useRef(0)
  const elapsedRef = useRef(0)
  useFrame((state, delta) => {
    elapsedRef.current += delta
    if (introRef.current < 1) introRef.current = Math.min(1, elapsedRef.current / 2)
    const introZ = 6 - smoothstep(introRef.current) * 1 
    let targetZ = 5
    if (scrollProgress <= 0.2) targetZ = 5
    else if (scrollProgress <= 0.4) {
      const t = (scrollProgress - 0.2) / 0.2
      targetZ = 5 - smoothstep(t) * 3 
    } else if (scrollProgress <= 0.8) targetZ = 2
    else {
      const t = (scrollProgress - 0.8) / 0.2
      targetZ = 2 + smoothstep(t) * 3 
    }
    const finalZ = introRef.current < 1 ? introZ : targetZ
    const parallaxX = state.pointer.x * 0.15
    const parallaxY = state.pointer.y * 0.1
    const camX = parallaxX
    const camY = parallaxY
    const camZ = finalZ
    if (Number.isFinite(camX) && Number.isFinite(camY) && Number.isFinite(camZ)) {
      state.camera.position.x += (camX - state.camera.position.x) * 0.08
      state.camera.position.y += (camY - state.camera.position.y) * 0.08
      state.camera.position.z += (camZ - state.camera.position.z) * 0.08
    }
    state.camera.lookAt(0, 0, 0)
  })
  return null
}
