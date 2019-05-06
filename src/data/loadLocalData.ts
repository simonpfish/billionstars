import Papa from 'papaparse'

export function triggerLoad() {
  document.getElementById('fileInput').click()
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false)

let reader = new FileReader()
reader.onload = e => {
  let text = reader.result
  console.log(text)
  // @ts-ignore
  let data = Papa.parse(text)
  console.log(data)
}

function handleFileSelect(e) {
  const file = this.files[0]

  reader.readAsText(file)
}

triggerLoad()
