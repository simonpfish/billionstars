import { init } from './scene/init'
import { initUI, SETTINGS } from './gui'

let { renderer, scene, camera, controls } = init()
let { gui, stats } = initUI()

animate()

function animate() {
  stats.begin()

  if (SETTINGS['Control mode'] == 'fly') {
    controls.update(1)
  } else {
    controls.update()
  }

  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}
