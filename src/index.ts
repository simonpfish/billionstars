import { renderer, scene, camera, controls, init } from './scene/init'
import { stats, initUI, SETTINGS } from './gui'

init()
initUI()
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
