import { PolarGridHelper, Scene } from 'three'
import { LineSegments } from 'three'

export default function addGrid(scene: Scene) {
  let radius = 5000 // in parsecs
  let radials = 8
  let circles = 10
  let divisions = 100

  // @ts-ignore
  let helper: LineSegments = new PolarGridHelper(
    radius * 0.1,
    radials,
    circles,
    divisions,
    0x444444,
    0x888888
  )

  scene.add(helper)
}
