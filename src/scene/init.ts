import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import FlyControls from 'three.fly'

const CONTAINER = document.getElementById('container')

export let controls, camera, scene, renderer

export function init() {
  camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 1000000)
  camera.position.z = 500

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  CONTAINER.appendChild(renderer.domElement)

  window.addEventListener(
    'resize',
    () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    false
  )

  initControls('orbit')
}

export function initControls(type: 'fly' | 'orbit') {
  // Dispose controls if they already exist and then initialize new ones

  if (camera == null) throw new Error('Camera is null. You must call init() first')

  switch (type) {
    case 'fly':
      if (controls != null) controls.dispose()
      controls = new FlyControls(camera, CONTAINER, THREE)
      controls.dragToLook = false
      break

    case 'orbit':
      if (controls != null) controls.destroy()
      controls = new OrbitControls(camera, CONTAINER)
      break
  }
}
