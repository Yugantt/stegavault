// src/pages/Preview3D.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import CrypticEye from '../components/three/shared/CrypticEye'
import SnowParticles from '../components/three/shared/SnowParticles'
import Aurora from '../components/three/shared/Aurora'
import DigitalPlanet from '../components/three/shared/DigitalPlanet'
import Portal from '../components/three/shared/Portal'

export default function Preview3D() {
  return (
    <div className="fixed inset-0 bg-bg-deep">
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#050807', 18, 45]} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 8, 5]} intensity={1.4} color="#10b981" />
          <pointLight position={[0, 0, 5]} intensity={2.5} color="#10b981" distance={15} />
          <pointLight position={[3, -1, 2]} intensity={2} color="#00d9ff" distance={12} />

          <Aurora position={[-3, 0, -8]} width={10} height={8} />
          <Aurora position={[3, 0, -9]} width={10} height={8} colorTop="#10b981" colorBottom="#00d9ff" />

          <Portal position={[0, 0.3, -3]} radius={1.6} />

          <group position={[-2.8, 0.3, 0]}>
            <CrypticEye scale={1} />
          </group>

          <group position={[2.8, 0.3, 0]}>
            <DigitalPlanet radius={1.1} />
          </group>

          <SnowParticles count={400} />

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={2.5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-6 left-6 p-4 rounded-xl glass border border-glass-border max-w-sm">
        <h2 className="font-heading text-lg font-bold text-primary">
          StegaVault 3.0 · 3D Preview
        </h2>
        <p className="text-xs text-muted mt-1 font-mono">
          PROCEDURAL · ZERO IMAGES
        </p>
        <ul className="text-xs text-muted-bright mt-3 space-y-1">
          <li>Cryptic Eye (glowing, pulsing)</li>
          <li>Digital Planet (wireframe, rotating)</li>
          <li>Portal (vortex ring)</li>
          <li>Aurora (noise shader)</li>
          <li>Snow (procedural particles)</li>
        </ul>
        <p className="text-[10px] text-muted mt-3 font-mono">
          DRAG to orbit · SCROLL to zoom
        </p>
      </div>
    </div>
  )
}
