import localForage from 'localforage'
import { clearStars, STAR_COUNT, STARS, setBlendingMode } from './scene/stars'
import dat from 'dat.gui'
import Stats from 'stats-js'
import { initControls } from './scene/init'
import { triggerLoad } from './data/loadLocalData'
import { toggleGrid } from './scene/grid'

export const stats = new Stats()

export const SETTINGS = {
  'Clear loaded data': () => {
    clearStars()
  },
  'Open CSV file': triggerLoad,
  'Max stars to load': 10000000,
  'Star size (pc)': 1,
  'Control mode': 'orbit',
  'Star shape': 'orb',
  'Blending Mode': 'default',
  'Toggle grid': toggleGrid
}

export function initUI() {
  const gui = new dat.GUI({ width: 300 })

  var folder1 = gui.addFolder('Load data')
  folder1.add(SETTINGS, 'Clear loaded data')
  folder1.add(SETTINGS, 'Open CSV file')
  folder1.add(SETTINGS, 'Star shape', ['orb', 'square'])
  folder1.add(SETTINGS, 'Max stars to load', 0, 100000000)

  var folder2 = gui.addFolder('Renderer configuration')
  folder2.add(SETTINGS, 'Star size (pc)', 0.1, 30).onFinishChange(value =>
    STARS.forEach(s => {
      s.material.size = value
    })
  )
  folder2
    .add(SETTINGS, 'Blending Mode', ['additive', 'default'])
    .onFinishChange(value => setBlendingMode(value))
  folder2
    .add(SETTINGS, 'Control mode', ['orbit', 'fly'])
    .onFinishChange(value => initControls(value))
  folder2.add(SETTINGS, 'Toggle grid')

  addStarCountPanel(stats)
  document.body.appendChild(stats.dom)

  return { stats, gui }
}

function addStarCountPanel(stats: Stats) {
  const starPanel = stats.addPanel(new Stats.Panel('Stars', '#ff8', '#221'))
  stats.showPanel(3)
  setInterval(() => starPanel.update(STAR_COUNT, 50000000), 1000)
}
