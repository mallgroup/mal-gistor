import axios from 'axios'

let httpClient = store => {
  var cfg = {
    baseURL: 'https://api.github.com',
    timeout: 10000,
    headers: { Accept: ' application/vnd.github.v3+json' },
    auth: {
      password: store.state.user.token || ''
    }
  }

  let HttpClient = axios.create(cfg)

  return HttpClient
}

export default ({ store, Vue }) => {
  Vue.prototype.$axios = httpClient(store)
}

const CONFIG_FILE_NAME = 'mal-gistor-config.json'

export { httpClient }
export { CONFIG_FILE_NAME }
