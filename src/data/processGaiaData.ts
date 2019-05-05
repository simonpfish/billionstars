import { interpolateRdBu } from 'd3-scale-chromatic'

export default data => {
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

function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}
