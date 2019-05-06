import { PolarGridHelper, Scene } from 'three'
import { LineSegments } from 'three'
import { scene } from './init'

let radius = 5000 // in parsecs
let radials = 8
let circles = 10
let divisions = 100

// @ts-ignore
const helper: LineSegments = new PolarGridHelper(
  radius * 0.1,
  radials,
  circles,
  divisions,
  0x444444,
  0x888888
)

let toggled = false

export function toggleGrid() {
  if (toggled) {
    scene.remove(helper)
  } else {
    scene.add(helper)
  }

  toggled = !toggled
}
