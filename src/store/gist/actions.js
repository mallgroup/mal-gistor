import { httpClient, CONFIG_FILE_NAME } from '../../boot/axios'

export async function remove ({ state, dispatch }, gist) {
  Object.keys(state.items).forEach(itemKey => {
    if (state.items[itemKey].id === gist.id) {
      delete state.items[itemKey]
    }
  })

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

  try {
    // patch configuration file
    await client.patch(`gists/${state.configId}`, {
      description: CONFIG_FILE_NAME,
      public: false,
      files
    })

    return true
  } catch (error) {
    if (error) {
      console.error(error)
    }

    return false
  }
}
