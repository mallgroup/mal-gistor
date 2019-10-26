import { LocalStorage } from 'quasar'

export function token (state, token) {
  state.token = token
  LocalStorage.set('token', token)
}
