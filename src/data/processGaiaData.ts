import { interpolateRdBu } from 'd3-scale-chromatic'

export default (ra_str, dec_str, p_str, btor_str) => {
  const scale = 1.0

  const ra = parseFloat(ra_str) * (Math.PI / 180.0)
  const dec = parseFloat(dec_str) * (Math.PI / 180.0)
  const parallax = parseFloat(p_str)
  const dist = (1 / (parallax / 1000.0)) * scale
  const btor = parseFloat(btor_str)

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
