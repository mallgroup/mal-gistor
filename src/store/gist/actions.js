import { LoadingBar } from 'quasar'
import { httpClient, CONFIG_FILE_NAME } from '../../boot/axios'
import { filter as _filter, mapValues as _mapValues } from 'lodash'

export async function remove ({ state, dispatch }, gist) {
  Object.keys(state.items).forEach(itemKey => {
    if (state.items[itemKey].id === gist.id) {
      delete state.items[itemKey]
    }
  })

  dispatch('updateConfig')
}

export async function removeCategory ({ state, commit, dispatch, getters }, categoryId) {
  // remove category from state
  commit('categories', _filter(state.categories, (cat) => cat.id !== categoryId))

  // remove category from items
  commit('items', _mapValues(state.items, (currentItem) => {
    let item = JSON.parse(JSON.stringify(currentItem))

    if (item.categories.indexOf(categoryId) > -1) {
      item.categories = _filter(item.categories, (catId) => catId !== categoryId)
    }

    return item
  }))

  dispatch('updateConfig')
}

export async function updateConfig ({ state, getters }) {
  const client = httpClient(this)

  // build configuration file
  let files = {}
  files[CONFIG_FILE_NAME] = {
    content: getters.toString,
    filename: CONFIG_FILE_NAME
  }

  LoadingBar.start()

  try {
    // patch configuration file
    await client.patch(`gists/${state.configId}`, {
      description: CONFIG_FILE_NAME,
      public: false,
      files
    })

    LoadingBar.stop()

    return true
  } catch (error) {
    if (error) {
      console.error(error)
    }

    LoadingBar.stop()

    return false
  }
}
