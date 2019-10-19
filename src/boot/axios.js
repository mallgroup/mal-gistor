import axios from 'axios'

export default ({ store, Vue }) => {
  var cfg = {
    baseURL: 'https://api.github.com',
    timeout: 5000,
    headers: { 'Accept': ' application/vnd.github.v3+json' },
    auth: {
      username: store.state.user.user || '',
      password: store.state.user.token || ''
    }
  }

  let HttpClient = axios.create(cfg)

  Vue.prototype.$axios = HttpClient
}
