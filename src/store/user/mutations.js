import { LocalStorage } from 'quasar'

export function token (state, token) {
  state.token = token
  LocalStorage.set('token', token)
}

export function user (state, user) {
  state.user = user
  LocalStorage.set('user', user)
}
