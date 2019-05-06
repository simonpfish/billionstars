import localForage from 'localforage'
import { clearStars, STARS } from './scene/stars'
import dat from 'dat.gui'
import Stats from 'stats-js'
import { initControls } from './scene/init'
import { triggerLoad } from './data/loadLocalData'

export const SETTINGS = {
  'Clear cache': () => {
    localForage.keys().then(keys => Promise.all(keys.map(key => localForage.removeItem(key))))
  },
  'Load CSV gaia data file': triggerLoad,
  'Max stars': 1000000,
  'Max parallax error': 0.01,
  'Fetch order': 'parallax desc',
  'Control mode': 'orbit'
}

export function initUI() {
  const gui = new dat.GUI({ width: 300 })
  gui.add(SETTINGS, 'Clear cache')
  gui.add(SETTINGS, 'Load CSV gaia data file')
  gui.add(SETTINGS, 'Max stars', 0, 10000000).onFinishChange(() => {
    // TODO: change the number of rendered stars
  })

  gui.add(SETTINGS, 'Control mode', ['orbit', 'fly']).onFinishChange(value => initControls(value))

  const stats = new Stats()
  addStarCountPanel(stats)
  document.body.appendChild(stats.dom)

  return { stats, gui }
}

function addStarCountPanel(stats: Stats) {
  const starPanel = stats.addPanel(new Stats.Panel('Stars', '#ff8', '#221'))
  stats.showPanel(3)
  setInterval(() => starPanel.update(STARS.length, 50000000), 1000)
}
