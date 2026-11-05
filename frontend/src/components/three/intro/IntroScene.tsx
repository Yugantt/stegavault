import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import Portal from '../shared/Portal'
import SnowParticles from '../shared/SnowParticles'
import MountainTerrain from '../shared/MountainTerrain'

interface IntroSceneProps {
  onComplete: () => void
  duration?: number
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export default function IntroScene({
  onComplete,
  duration = 8,
}: IntroSceneProps) {
  const { camera } = useThree()
  const progressRef = useRef(0)
  const completedRef = useRef(false)

  const portalGroupRef = useRef<THREE.Group>(null)
  const eyeSwarmRef = useRef<THREE.Points>(null)
  const eyeGroupRef = useRef<THREE.Group>(null)
  const shockwave1Ref = useRef<THREE.Mesh>(null)
  const shockwave2Ref = useRef<THREE.Mesh>(null)
  const snowGroupRef = useRef<THREE.Group>(null)

  // ── Eye Swarm: 3D SPHERE shell + iris disc + pupil point ──
  const { initialPos, targetPos } = useMemo(() => {
    const count = 900
    const init = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)
    let seed = 123
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let i = 0; i < count; i++) {
      // Initial: scattered in 3D cube
      init[i * 3] = (rand() - 0.5) * 50
      init[i * 3 + 1] = (rand() - 0.5) * 40
      init[i * 3 + 2] = (rand() - 0.5) * 30 - 5

      const segment = i / count
      const radius = 2.2

      if (segment < 0.55) {
        // 55%: sphere shell (sclera)
        const theta = rand() * Math.PI * 2
        const phi = Math.acos(2 * rand() - 1)
        const r = radius * (0.95 + rand() * 0.05)
        target[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        target[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        target[i * 3 + 2] = r * Math.cos(phi)
      } else if (segment < 0.85) {
        // 30%: iris disc (front of sphere)
        const angle = rand() * Math.PI * 2
        const r = rand() * 1.4
        target[i * 3] = Math.cos(angle) * r
        target[i * 3 + 1] = Math.sin(angle) * r
        target[i * 3 + 2] = radius * 0.85 + rand() * 0.15
      } else {
        // 15%: pupil (dense center)
        const angle = rand() * Math.PI * 2
        const r = rand() * 0.5
        target[i * 3] = Math.cos(angle) * r
        target[i * 3 + 1] = Math.sin(angle) * r
        target[i * 3 + 2] = radius * 0.9
      }
    }
    return { initialPos: init, targetPos: target }
  }, [])

  const dummyCurrentPos = useMemo(
    () => new Float32Array(initialPos.length),
    [initialPos.length],
  )

  useFrame((_state, delta) => {
    /* eslint-disable react-hooks/immutability */
    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta / duration)
    }
    const p = progressRef.current

    // ── 1. Portal growth (15% → 35%) ──
    if (portalGroupRef.current) {
      const pt = smoothstep((p - 0.15) / 0.2)
      portalGroupRef.current.scale.setScalar(Math.max(0.001, pt))
      portalGroupRef.current.rotation.z = p * 0.4
    }

    // ── 2. Eye swarm convergence (35% → 65%) ──
    if (eyeSwarmRef.current) {
      const et = smoothstep((p - 0.35) / 0.3)
      const posAttr = eyeSwarmRef.current.geometry.attributes
        .position as THREE.BufferAttribute
      for (let i = 0; i < initialPos.length / 3; i++) {
        const cx = THREE.MathUtils.lerp(initialPos[i * 3], targetPos[i * 3], et)
        const cy = THREE.MathUtils.lerp(
          initialPos[i * 3 + 1],
          targetPos[i * 3 + 1],
          et,
        )
        const cz = THREE.MathUtils.lerp(
          initialPos[i * 3 + 2],
          targetPos[i * 3 + 2],
          et,
        )
        posAttr.setXYZ(i, cx, cy, cz)
      }
      posAttr.needsUpdate = true

      // Rotate swarm slowly as it forms
      eyeSwarmRef.current.rotation.y = et * Math.PI * 0.8
    }

    // ── 3. Solid eye (65% → 80%) ──
    if (eyeGroupRef.current) {
      const solidPt = smoothstep((p - 0.65) / 0.15)
      eyeGroupRef.current.scale.setScalar(Math.max(0.001, solidPt))
      eyeGroupRef.current.rotation.y = (1 - solidPt) * Math.PI
    }

    // ── 4. Shockwave rings ──
    if (shockwave1Ref.current) {
      if (p >= 0.7 && p <= 0.95) {
        const st = (p - 0.7) / 0.25
        shockwave1Ref.current.scale.setScalar(1 + st * 22)
        ;(shockwave1Ref.current.material as THREE.MeshBasicMaterial).opacity =
          Math.max(0, 0.9 - st * 1.2)
      } else {
        ;(shockwave1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0
      }
    }
    if (shockwave2Ref.current) {
      if (p >= 0.75 && p <= 1) {
        const st = (p - 0.75) / 0.25
        shockwave2Ref.current.scale.setScalar(1 + st * 30)
        ;(shockwave2Ref.current.material as THREE.MeshBasicMaterial).opacity =
          Math.max(0, 0.6 - st * 1.5)
      } else {
        ;(shockwave2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0
      }
    }

    if (snowGroupRef.current) {
      const st = smoothstep(p / 0.15)
      snowGroupRef.current.visible = st > 0.05
    }

    // ── 5. CINEMATIC ARC CAMERA ──
    // Phase A (0-0.35): drift in from high, far away
    // Phase B (0.35-0.65): arc down, eye forming in front
    // Phase C (0.65-0.85): pull back as shockwave hits
    // Phase D (0.85-1.0): warp through portal into darkness

    let camX = 0
    let camY = 3
    let camZ = 14
    let lookX = 0
    let lookY = 0
    let lookZ = -3

    if (p < 0.35) {
      const t = p / 0.35
      camX = THREE.MathUtils.lerp(2, 0, t)
      camY = THREE.MathUtils.lerp(6, 2, t)
      camZ = THREE.MathUtils.lerp(16, 12, t)
      lookY = 0
      lookZ = -4
    } else if (p < 0.65) {
      const t = (p - 0.35) / 0.3
      camX = THREE.MathUtils.lerp(0, -1, t)
      camY = THREE.MathUtils.lerp(2, 0.5, t)
      camZ = THREE.MathUtils.lerp(12, 8, t)
      lookY = 0.5
      lookZ = -2
    } else if (p < 0.85) {
      const t = (p - 0.65) / 0.2
      camX = THREE.MathUtils.lerp(-1, 0, t)
      camY = THREE.MathUtils.lerp(0.5, 0.5, t)
      camZ = THREE.MathUtils.lerp(8, 6, t)
      // Shake on shockwave
      if (t > 0.2 && t < 0.6) {
        camX += (Math.random() - 0.5) * 0.15
        camY += (Math.random() - 0.5) * 0.15
      }
      lookY = 0.5
      lookZ = -2
    } else {
      const t = (p - 0.85) / 0.15
      // Warp through portal
      camX = 0
      camY = THREE.MathUtils.lerp(0.5, 0, t)
      camZ = THREE.MathUtils.lerp(6, -8, Math.pow(t, 1.5))
      lookY = 0
      lookZ = -15
    }

    camera.position.set(camX, camY, camZ)
    camera.lookAt(lookX, lookY, lookZ)

    if (p > 0.98 && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
    /* eslint-enable react-hooks/immutability */
  })

  return (
    <>
      <fog attach="fog" args={['#050807', 12, 45]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 15]} intensity={1.4} color="#10b981" />
      <pointLight
        position={[0, 1, 2]}
        intensity={3}
        color="#10b981"
        distance={18}
      />
      <pointLight
        position={[0, 0, -6]}
        intensity={2.5}
        color="#00d9ff"
        distance={20}
      />

      {/* Multi-layer 3D mountains */}
      <MountainTerrain />

      {/* Snow */}
      <group ref={snowGroupRef}>
        <SnowParticles count={500} />
      </group>

      {/* Portal — real 3D tunnel */}
      <group ref={portalGroupRef} position={[0, 1, -6]}>
        <Portal position={[0, 0, 0]} radius={3} intensity={1.4} />
      </group>

      {/* Particle swarm forming eye in 3D */}
      <points ref={eyeSwarmRef} position={[0, 1, -2]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dummyCurrentPos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#00d9ff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Solid eye reveal */}
      <group ref={eyeGroupRef} position={[0, 1, -2]}>
        <mesh>
          <sphereGeometry args={[2.2, 48, 48]} />
          <meshStandardMaterial
            color="#0a1018"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0, 2.05]}>
          <ringGeometry args={[0.7, 1.6, 64]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={2.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 2.15]}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <mesh position={[0.08, 0.08, 2.16]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>

      {/* Dual shockwaves on eye reveal */}
      <mesh ref={shockwave1Ref} position={[0, 1, -2]}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={shockwave2Ref} position={[0, 1, -2]}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
