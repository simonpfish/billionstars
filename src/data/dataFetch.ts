import localForage from 'localforage'
import uuid from 'uuid'
import fetch from 'fetch-retry'
import processGaiaData from './processGaiaData'

const NUM_THREADS = 10
const STEP_SIZE = 10000

export function loadCache() {
  return localForage
    .keys()
    .then(keys => Promise.all(keys.map(key => localForage.getItem(key))))
    .catch(reason => {
      console.error(`Error using local storage: ${reason}`)
    })
}

export function fetchStars(offset, stopCondition, maxParError, fetchOrder) {
  if (stopCondition()) return

  let fetchPromises = []
  for (let i = 0; i < NUM_THREADS; i++) {
    fetchPromises.push(fetchGaiaData(STEP_SIZE, offset + STEP_SIZE * i, maxParError, fetchOrder))
  }
  return Promise.all(fetchPromises).then(values => {
    values.forEach(data => {
      localForage.setItem(uuid(), data)
    })

    const newOffset = offset + STEP_SIZE * NUM_THREADS

    return fetchStars(newOffset, stopCondition, maxParError, fetchOrder)
  })
}

function fetchGaiaData(amount, offset, maxParError, fetchOrder) {
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
    and parallax / parallax_error >= ${1.0 / maxParError}
    and ra is not null 
    and dec is not null 
    and bp_rp is not null 
    order by ${fetchOrder} 
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
      return data
    })
}
