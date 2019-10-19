export function logout ({ commit }) {
  commit('user', '')
  commit('token', '')

  window.location.reload()
}
