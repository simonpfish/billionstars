import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// @ts-ignore
import StarTexture from './textures/star.png'

const { renderer, scene, camera, controls } = init()
fetchGaiaData().then(data => addStars(data))
animate()

function init() {
  const camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 1000000)
  camera.position.z = 2750

  const controls = new OrbitControls(camera)

  const scene = new THREE.Scene()

  const light = new THREE.AmbientLight(0xffffff, 100) // soft white light

  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  const container = document.getElementById('container')
  container.appendChild(renderer.domElement)

  window.addEventListener(
    'resize',
    () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    false
  )

  return { renderer, scene, camera, controls }
}

function fetchGaiaData() {
  const params = new URLSearchParams()
  params.append('LANG', 'ADQL')
  params.append('REQUEST', 'doQuery')
  params.append('FORMAT', 'json')
  params.append(
    'QUERY',
    `select top 100000
    random_index,ra,dec,parallax,bp_rp
    from gaiadr2.gaia_source 
    where parallax is not null 
    and ra is not null 
    and dec is not null 
    and bp_rp is not null 
    order by random_index`
  )

  // Table info: https://gea.esac.esa.int/archive/documentation/GDR2/Gaia_archive/chap_datamodel/sec_dm_main_tables/ssec_dm_gaia_source.html
  // Table info: https://gea.esac.esa.int/archive/documentation/GDR2/Catalogue_consolidation/chap_cu9gat/sec_cu9gat_intro/

  return fetch('http://gea.esac.esa.int/tap-server/tap/sync', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: params.toString()
  }).then(response => response.json())
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

function processGaiaData(data) {
  const scale = 500.0

  const ra = parseFloat(data[1]) * (Math.PI / 180.0)
  const dec = parseFloat(data[2]) * (Math.PI / 180.0)
  const parallax = parseFloat(data[3])
  const dist = (1 / parallax) * scale
  const btor = parseFloat(data[4])

  const x = dist * Math.cos(dec) * Math.cos(ra)
  const y = dist * Math.cos(dec) * Math.sin(ra)
  const z = dist * Math.sin(dec)

  const [r, g, b] = [map(btor, 0, 3, 0, 1), 0.5, map(btor, 0, 3, 1, 0)]

  return [x, y, z, r, g, b]
}

function addStars(data) {
  console.log('rendering particles')
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  console.log(data)

  for (var i = 0; i < data.data.length; i++) {
    const [x, y, z, r, g, b] = processGaiaData(data.data[i])
    positions.push(x, y, z)
    colors.push(r, g, b)
  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  var texture = new THREE.TextureLoader().load(StarTexture)

  const material = new THREE.PointsMaterial({
    size: 10,
    vertexColors: THREE.VertexColors,
    // transparent: true,
    // blending: THREE.AdditiveBlending,
    // map: texture,
    depthTest: false
  })

  const points = new THREE.Points(geometry, material)

  scene.add(points)
}
