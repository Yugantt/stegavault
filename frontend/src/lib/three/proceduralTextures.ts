import * as THREE from 'three'

export function createRadialGradient(
  color = '#10b981',
  size = 256,
): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)')
  grad.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ',0.6)')
  grad.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ',0.15)')
  grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function createIrisTexture(size = 512): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const radius = size / 2

  let seed = 9119
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  // 1. Base radial gradient (bright center -> emerald -> dark edge)
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, radius)
  grad.addColorStop(0.0, '#00d9ff')
  grad.addColorStop(0.12, '#34d399')
  grad.addColorStop(0.35, '#10b981')
  grad.addColorStop(0.75, '#059669')
  grad.addColorStop(0.95, '#064e3b')
  grad.addColorStop(1.0, '#020617')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cx, radius, 0, Math.PI * 2)
  ctx.fill()

  // 2. Radial fibers (72 lines)
  ctx.globalCompositeOperation = 'overlay'
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2 + rand() * 0.05
    const opacity = 0.2 + rand() * 0.5
    ctx.strokeStyle = 'rgba(52, 211, 153, ' + opacity + ')'
    ctx.lineWidth = 0.4 + rand() * 1.8
    ctx.beginPath()
    const innerR = radius * 0.14
    const outerR = radius * (0.82 + rand() * 0.15)
    ctx.moveTo(cx + Math.cos(angle) * innerR, cx + Math.sin(angle) * innerR)
    ctx.lineTo(cx + Math.cos(angle) * outerR, cx + Math.sin(angle) * outerR)
    ctx.stroke()
  }

  // 3. Concentric rings (subtle)
  ctx.globalCompositeOperation = 'screen'
  for (let i = 1; i <= 5; i++) {
    ctx.strokeStyle = 'rgba(0, 217, 255, ' + (0.18 - i * 0.025) + ')'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(cx, cx, radius * (0.25 + i * 0.13), 0, Math.PI * 2)
    ctx.stroke()
  }

  // 4. Outer dark rim
  ctx.globalCompositeOperation = 'source-over'
  const rim = ctx.createRadialGradient(cx, cx, radius * 0.9, cx, cx, radius)
  rim.addColorStop(0, 'rgba(0, 0, 0, 0)')
  rim.addColorStop(1, 'rgba(0, 0, 0, 0.95)')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(cx, cx, radius, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}
