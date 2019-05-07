import Papa from 'papaparse'
import processGaiaData from './processGaiaData'
import { addStars, STARS, STAR_COUNT } from '../scene/stars'
import { SETTINGS } from '../gui'

export function triggerLoad() {
  document.getElementById('fileInput').click()
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false)

function handleFileSelect(e) {
  const file = this.files[0]

  Papa.parse(file, {
    fastMode: true,
    header: true,
    chunk: (results, parser) => {
      let processed = results.data.map(starData => {
        let { ra, dec, parallax, bp_rp } = starData
        return processGaiaData(ra, dec, parallax, bp_rp)
      })
      addStars(processed)
      if (STAR_COUNT >= SETTINGS['Max stars to load']) {
        parser.abort()
      }
    },
    complete: () => {
      console.log(STARS.length)
      console.log('done')
    }
  })
}
