export function count (state) {
  return Object.keys(state.items).length
}

export function groupByLanguage (state) {
  let languages = []

  var items = JSON.parse(JSON.stringify(state.items))

  for (let item of items) {
    for (let fileKey in item.files) {
      let file = item.files[fileKey]
      if (typeof languages[file.language] === 'undefined') {
        if (!file.language) {
          file.language = 'uknown'
        }

        languages[file.language] = {
          language: file.language,
          count: 1
        }
      } else {
        languages[file.language] = {
          language: file.language,
          count: ++languages[file.language].count
        }
      }
    }
  }

  return Object.values(languages).sort((a, b) => (a.count < b.count ? 1 : -1))
}
