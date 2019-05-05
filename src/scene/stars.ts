import * as THREE from 'three'
import { Scene } from 'three'

export const STARS = []

export function addStars(data, scene: THREE.Scene, size) {
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  for (let i = 0; i < data.length; i++) {
    const [x, y, z, r, g, b] = data[i]
    positions.push(x, y, z)
    colors.push(r, g, b)
  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: size,
    vertexColors: THREE.VertexColors,
    transparent: true,
    // blending: THREE.AdditiveBlending,
    map: createCanvasCircleMaterial(256),
    depthTest: false
  })

  const stars = new THREE.Points(geometry, material)
  STARS.push(stars)
  scene.add(stars)
  return stars
}

function createCanvasCircleMaterial(size) {
  let matCanvas = document.createElement('canvas')
  matCanvas.width = matCanvas.height = size
  let ctx = matCanvas.getContext('2d')
  let texture = new THREE.Texture(matCanvas)
  let radgrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)

  radgrad.addColorStop(0, 'rgba(255,255,255,1)')
  radgrad.addColorStop(0.4, 'rgba(255,255,255,1)')
  radgrad.addColorStop(1, 'rgba(255,255,255,0.0)')

  ctx.fillStyle = radgrad
  ctx.fillRect(0, 0, size, size)
  texture.needsUpdate = true
  return texture
}

export function clearStars(scene: Scene) {
  STARS.forEach(star => {
    scene.remove(star)
  })
}
