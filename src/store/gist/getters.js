import { orderBy as _orderBy } from 'lodash'

export function count (state) {
  return Object.keys(state.items).length
}

export const findConfigCategoryById = state => categoryId => {
  try {
    return state.config.categories.filter(
      configCategory => configCategory.id === categoryId
    )[0]
  } catch (error) {
    return null
  }
}

export function groupByLanguage (state) {
  let languages = []

  var items = JSON.parse(JSON.stringify(state.items))

  Object.keys(items).forEach(itemKey => {
    let item = items[itemKey]

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
          count: languages[file.language].count + 1
        }
      }
    }
  })

  return Object.values(languages).sort((a, b) => (a.count < b.count ? 1 : -1))
}

export const filterGistsByCategory = state => categoryId => {
  try {
    if (categoryId) {
      return _orderBy(
        state.items.filter(item => {
          return state.config.items[item.id].categories.indexOf(categoryId) > -1
        }),
        ['created_at'],
        ['desc']
      )
    }
  } catch (error) {
    if (error) {
      // do nothing here
    }
  }

  if (categoryId === '') {
    return _orderBy(state.items, ['created_at'], ['desc'])
  }

  return []
}

export function toString (state) {
  // filter out files
  var items = JSON.parse(JSON.stringify(state.items))

  for (let itemKey in state.items) {
    delete items[itemKey].files // delete files
    delete items[itemKey].__index // from Quasar table

    // remove timestamps as well
    delete items[itemKey].created_at
    delete items[itemKey].updated_at
  }

  return JSON.stringify({
    items,
    categories: state.categories
  })
}
