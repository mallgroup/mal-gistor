import { httpClient, CONFIG_FILE_NAME } from '../../boot/axios'

export async function updateConfig ({ commit, getters }, config) {
  commit('config', config) // update state

  const client = httpClient(this)

  // build configuration file
  let files = {}
  files[CONFIG_FILE_NAME] = {
    content: getters.toString,
    filename: CONFIG_FILE_NAME
  }

  try {
    // patch configuration file
    await client.patch(`gists/${config.id}`, {
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
