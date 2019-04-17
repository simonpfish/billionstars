import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats-js'
import localForage from 'localforage'
import { interpolateRdBu } from 'd3-scale-chromatic'
import fetch from 'fetch-retry'
import uuid from 'uuid'
import dat from 'dat.gui'

const { renderer, scene, camera, controls } = init()

let cancelFetch = false
const settings = {
  'Clear cache': () => {
    cancelFetch = true
    return fetchProcess.then(() =>
      localForage
        .keys()
        .then(keys => Promise.all(keys.map(key => localForage.removeItem(key))))
        .then(() => {
          clearStars()

          restartFetch()
        })
    )
  },
  'Max stars': 1000000,
  'Fetch order': 'parallax desc'
}

const gui = new dat.GUI({ width: 300 })
gui.add(settings, 'Clear cache')
gui.add(settings, 'Max stars', 0, 10000000).onFinishChange(() => {
  cancelFetch = true
  if (fetchProcess == null) restartFetch()
  else
    fetchProcess.then(() => {
      restartFetch()
    })
}) // on change re-trigger star fetch
gui.add(settings, 'Fetch order', ['parallax desc', 'random_index']).onFinishChange(value => {
  cancelFetch = true
  if (fetchProcess == null) restartFetch()
  else
    fetchProcess
      // .then(() => localForage.keys())
      // .then(keys => Promise.all(keys.map(key => localForage.removeItem(key))))
      .then(() => {
        // clearStars()
        restartFetch()
      })
})

let starCount = 0 // updated on every call to addStars()

const stats = new Stats()
const starPanel = stats.addPanel(new Stats.Panel('Stars', '#ff8', '#221'))
stats.showPanel(3)
setInterval(() => starPanel.update(starCount, 10000000), 1000)
document.body.appendChild(stats.dom)

let fetchProcess = loadCache().then(() => fetchStars(10, 5000, starCount))

animate()

function restartFetch() {
  cancelFetch = false
  fetchProcess = fetchStars(10, 5000, starCount)
}

function clearStars() {
  starCount = 0
  while (scene.children.length > 0) {
    scene.remove(scene.children[0])
  }
}

function animate() {
  stats.begin()
  // controls.update()
  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}

function init() {
  const container = document.getElementById('container')

  const camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 1000000)
  camera.position.z = 2750

  const controls = new OrbitControls(camera, container)

  const scene = new THREE.Scene()

  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

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

function loadCache() {
  return localForage
    .keys()
    .then(keys =>
      Promise.all(keys.map(key => localForage.getItem(key).then(data => addStars(data))))
    )
    .then(() => {
      console.log(`Loaded ${starCount} stars from local cache`)
    })
    .catch(reason => {
      console.error(`Error using local storage: ${reason}`)
    })
}

function fetchStars(numThreads, stepSize, offset) {
  if (starCount >= settings['Max stars'] || cancelFetch) return

  let fetchPromises = []
  for (let i = 0; i < numThreads; i++) {
    fetchPromises.push(fetchGaiaData(stepSize, offset + stepSize * i))
  }
  return Promise.all(fetchPromises).then(values => {
    values.forEach(data => {
      localForage.setItem(uuid(), data)
    })

    const newOffset = offset + stepSize * numThreads
    if (stepSize < 25000 && offset >= 500000) {
      stepSize = 25000
    }
    if (stepSize < 50000 && offset >= 1000000) {
      stepSize = 50000
    }
    return fetchStars(numThreads, stepSize, newOffset)
  })
}

function fetchGaiaData(amount, offset) {
  const params = new URLSearchParams()
  params.append('LANG', 'ADQL')
  params.append('REQUEST', 'doQuery')
  params.append('FORMAT', 'json')
  params.append(
    'QUERY',
    `select top ${amount}
    random_index,ra,dec,parallax,bp_rp,parallax_error,ra_error,dec_error
    from gaiadr2.gaia_source 
    where parallax is not null
    and parallax >= 0 
    and parallax / parallax_error >= 4
    and ra_error <= 4
    and dec_error <= 4
    and ra is not null 
    and dec is not null 
    and bp_rp is not null 
    order by ${settings['Fetch order']} 
    offset ${offset};`
  )

  // Table info: https://gea.esac.esa.int/archive/documentation/GDR2/Gaia_archive/chap_datamodel/sec_dm_main_tables/ssec_dm_gaia_source.html
  // Table info: https://gea.esac.esa.int/archive/documentation/GDR2/Catalogue_consolidation/chap_cu9gat/sec_cu9gat_intro/

  return fetch('https://cors-anywhere.herokuapp.com/http://gea.esac.esa.int/tap-server/tap/sync', {
    method: 'POST',
    mode: 'cors',
    retries: 3,
    retryDelay: 1000,
    cache: 'force-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Content-Type-Options': 'nosniff'
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: params.toString()
  })
    .then(response => response.json())
    .then(object => {
      const data = object.data.map(processGaiaData)
      addStars(data)
      return data
    })
}

function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

function processGaiaData(data) {
  const scale = 1.0

  const ra = parseFloat(data[1]) * (Math.PI / 180.0)
  const dec = parseFloat(data[2]) * (Math.PI / 180.0)
  const parallax = parseFloat(data[3])
  const dist = (1 / (parallax / 1000.0)) * scale
  const btor = parseFloat(data[4])

  const x = dist * Math.cos(dec) * Math.cos(ra)
  const y = dist * Math.cos(dec) * Math.sin(ra)
  const z = dist * Math.sin(dec)

  const rgb = interpolateRdBu(map(btor, 0.2, 3, 0.2, 1))
  const [r, g, b] = rgb
    .substring(4, rgb.length - 1)
    .replace(/ /g, '')
    .split(',')
    .map(x => map(parseInt(x), 0, 255, 0.2, 1))

  return [x, y, z, r, g, b]
}

function addStars(data) {
  starCount += data.length
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  for (var i = 0; i < data.length; i++) {
    const [x, y, z, r, g, b] = data[i]
    positions.push(x, y, z)
    colors.push(r, g, b)
  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: THREE.VertexColors,
    transparent: true,
    // blending: THREE.AdditiveBlending,
    map: createCanvasCircleMaterial(256),
    depthTest: false
  })

  const points = new THREE.Points(geometry, material)

  scene.add(points)
}

function createCanvasCircleMaterial(size) {
  var matCanvas = document.createElement('canvas')
  matCanvas.width = matCanvas.height = size
  var ctx = matCanvas.getContext('2d')
  // create exture object from canvas.
  var texture = new THREE.Texture(matCanvas)
  // Draw a circle
  var radgrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)

  radgrad.addColorStop(0, 'rgba(255,255,255,1)')
  radgrad.addColorStop(0.4, 'rgba(255,255,255,1)')
  radgrad.addColorStop(1, 'rgba(255,255,255,0.0)')

  // draw shape
  ctx.fillStyle = radgrad
  ctx.fillRect(0, 0, size, size)
  // need to set needsUpdate
  texture.needsUpdate = true
  // return a texture made from the canvas
  return texture
}
