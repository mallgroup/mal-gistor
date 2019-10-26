import { LocalStorage } from 'quasar'

export default {
  token: LocalStorage.getItem('token') || '',
  avatarUrl: ''
}
