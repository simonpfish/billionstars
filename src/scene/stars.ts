import * as THREE from 'three'
import { scene } from '../scene/init'
import { SETTINGS } from '../gui'

export const STARS = []
export let STAR_COUNT = 0

export function addStars(data) {
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
    size: SETTINGS['Star size (pc)'],
    vertexColors: THREE.VertexColors,
    transparent: true,
    blending:
      SETTINGS['Blending Mode'] == 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
    map: SETTINGS['Star shape'] == 'orb' ? createCanvasCircleMaterial(256) : null,
    depthTest: false
  })

  const stars = new THREE.Points(geometry, material)
  STAR_COUNT += data.length
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

export function clearStars() {
  STARS.forEach(star => {
    scene.remove(star)
  })
  STAR_COUNT = 0
}

export function setBlendingMode(blending: 'additive' | 'default') {
  STARS.forEach(s => {
    s.material.blending = blending == 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending
    s.material.needsUpdate = true
  })
}
