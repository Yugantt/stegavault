import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = [
  'varying vec2 vUv;',
  'void main() {',
  '  vUv = uv;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '}',
].join('\n')

const fragmentShader = [
  'uniform float uTime;',
  'uniform vec3 uColorTop;',
  'uniform vec3 uColorBottom;',
  'varying vec2 vUv;',
  '',
  'float hash(vec2 p) {',
  '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
  '}',
  '',
  'float noise(vec2 p) {',
  '  vec2 i = floor(p);',
  '  vec2 f = fract(p);',
  '  float a = hash(i);',
  '  float b = hash(i + vec2(1.0, 0.0));',
  '  float c = hash(i + vec2(0.0, 1.0));',
  '  float d = hash(i + vec2(1.0, 1.0));',
  '  vec2 u = f * f * (3.0 - 2.0 * f);',
  '  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;',
  '}',
  '',
  'float fbm(vec2 p) {',
  '  float v = 0.0;',
  '  float a = 0.5;',
  '  for (int i = 0; i < 4; i++) {',
  '    v += a * noise(p);',
  '    p *= 2.0;',
  '    a *= 0.5;',
  '  }',
  '  return v;',
  '}',
  '',
  'void main() {',
  '  float n = fbm(vUv * 3.5 + vec2(uTime * 0.04, -uTime * 0.02));',
  '  float intensity = smoothstep(0.28, 1.0, n);',
  '  intensity *= (1.0 - vUv.y);',
  '  intensity *= smoothstep(0.0, 0.12, vUv.y);',
  '  vec3 col = mix(uColorBottom, uColorTop, vUv.y);',
  '  gl_FragColor = vec4(col, intensity * 0.7);',
  '}',
].join('\n')

interface AuroraProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  colorTop?: string
  colorBottom?: string
}

export default function Aurora({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 8,
  height = 6,
  colorTop = '#00d9ff',
  colorBottom = '#10b981',
}: AuroraProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color(colorTop) },
      uColorBottom: { value: new THREE.Color(colorBottom) },
    }),
    [colorTop, colorBottom],
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
