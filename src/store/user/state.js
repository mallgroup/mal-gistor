import { LocalStorage } from 'quasar'

export default {
  token: LocalStorage.getItem('token') || '',
  user: LocalStorage.getItem('user') || ''
}
