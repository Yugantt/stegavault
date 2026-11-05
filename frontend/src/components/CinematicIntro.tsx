// src/components/CinematicIntro.tsx
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import MountainTerrain from './three/shared/MountainTerrain'
import SnowParticles from './three/shared/SnowParticles'
import Aurora from './three/shared/Aurora'
import VaultDoor from './three/shared/VaultDoor'

const DURATION = 8

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function Scene({
  progressRef,
  onComplete,
}: {
  progressRef: React.MutableRefObject<number>
  onComplete: () => void
}) {
  const { camera } = useThree()
  const vaultRef = useRef<THREE.Group>(null)
  const finishedRef = useRef(false)

  useFrame((_, delta) => {
    if (finishedRef.current) return
    progressRef.current = Math.min(1, progressRef.current + delta / DURATION)
    const p = progressRef.current

    // Camera dolly path
    let camZ = 18
    let camY = 1.5
    let camX = 0
    let shake = 0

    if (p < 0.3) {
      // Slow approach through fog
      const t = smoothstep(p / 0.3)
      camZ = 18 - t * 4
      camY = 1.5 - t * 0.3
    } else if (p < 0.5) {
      // Vault reveals
      const t = smoothstep((p - 0.3) / 0.2)
      camZ = 14 - t * 2
      camY = 1.2 - t * 0.1
    } else if (p < 0.85) {
      // Door opens, camera accelerates
      const t = smoothstep((p - 0.5) / 0.35)
      camZ = 12 - t * 10
      camY = 1.1 - t * 0.2
      // Impact shake during opening
      shake = Math.sin(p * Math.PI * 6) * 0.06 * t
    } else {
      // Dive through
      const t = Math.pow((p - 0.85) / 0.15, 2)
      camZ = 2 - t * 8
      camY = 0.9 - t * 0.9
      shake = 0.15 * (1 - t)
    }

    camera.position.set(camX + shake, camY + shake, camZ)
    camera.lookAt(0, 0.3, 0)

    // Vault door scales in
    if (vaultRef.current) {
      const scaleT = smoothstep((p - 0.1) / 0.35)
      vaultRef.current.scale.setScalar(Math.max(0.001, scaleT))
    }

    if (p >= 1 && !finishedRef.current) {
      finishedRef.current = true
      onComplete()
    }
  })

  return (
    <>
      <color attach="background" args={['#020507']} />
      <fog attach="fog" args={['#020507', 10, 30]} />

      <ambientLight intensity={0.3} color="#0a1a18" />
      <directionalLight
        position={[0, 8, -5]}
        intensity={1}
        color="#10b981"
      />
      <pointLight
        position={[0, 0.3, 4]}
        intensity={1.5}
        color="#00d9ff"
        distance={8}
      />

      {/* Mountains far below */}
      <group position={[0, -5, -14]}>
        <MountainTerrain />
      </group>

      {/* Aurora curtains */}
      <Aurora position={[-6, 1, -16]} width={16} height={10} />
      <Aurora
        position={[6, 1, -18]}
        width={16}
        height={10}
        colorTop="#10b981"
        colorBottom="#00d9ff"
      />

      {/* Snow falling */}
      <SnowParticles count={300} />

      {/* VAULT DOOR — focal point */}
      <group ref={vaultRef} position={[0, 0.3, 0]} scale={0.001}>
        <VaultDoor progress={progressRef} />
      </group>
    </>
  )
}

function CinematicOverlay({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>
}) {
  const [titleOpacity, setTitleOpacity] = useState(0)
  const [subOpacity, setSubOpacity] = useState(0)
  const [letterSpacing, setLetterSpacing] = useState(0.5)

  useEffect(() => {
    const id = setInterval(() => {
      const p = progressRef.current
      const titleT = Math.max(0, Math.min(1, (p - 0.45) / 0.25))
      const subT = Math.max(0, Math.min(1, (p - 0.6) / 0.2))
      setTitleOpacity(titleT)
      setSubOpacity(subT)
      setLetterSpacing(0.5 - titleT * 0.42)
    }, 40)
    return () => clearInterval(id)
  }, [progressRef])

  return (
    <>
      {/* Letterbox cinematic bars */}
      <div className="absolute top-0 left-0 right-0 h-[10vh] bg-black z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black z-10 pointer-events-none" />

      {/* Title center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <h1
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold text-white"
          style={{
            opacity: titleOpacity,
            letterSpacing: `${letterSpacing}em`,
            textShadow:
              '0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.4)',
            transition: 'opacity 80ms linear',
          }}
        >
          Stega<span className="text-primary">Vault</span>
        </h1>
        <p
          className="mt-6 text-[10px] md:text-xs font-mono tracking-[0.5em] text-primary/80 uppercase"
          style={{ opacity: subOpacity }}
        >
          Hide in Plain Sight
        </p>
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(2,5,7,0.85) 100%)',
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-20"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
    </>
  )
}

export default function CinematicIntro({
  onComplete,
}: {
  onComplete: () => void
}) {
  const progressRef = useRef(0)
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const completedRef = useRef(false)

  const handleComplete = () => {
    if (completedRef.current) return
    completedRef.current = true
    setFadeOut(true)
    setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 700)
  }

  // Safety fallback
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!completedRef.current) handleComplete()
    }, 12000)
    return () => clearTimeout(fallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#020507] transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Canvas
        camera={{ position: [0, 1.5, 18], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene
            progressRef={progressRef}
            onComplete={handleComplete}
          />
        </Suspense>
      </Canvas>

      <CinematicOverlay progressRef={progressRef} />

      {/* Skip button */}
      <button
        onClick={handleComplete}
        className="absolute bottom-[12vh] right-8 px-5 py-2.5 rounded-full text-[10px] font-mono tracking-[0.25em] text-white/60 border border-white/15 hover:border-primary/60 hover:text-white backdrop-blur-md bg-black/40 transition-all cursor-pointer uppercase z-30"
      >
        Skip ›
      </button>
    </div>
  )
}
