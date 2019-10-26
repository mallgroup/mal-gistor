export function logout ({ commit }) {
  commit('token', '')

  // reset gist config as well
  commit('gist/clear', null, {
    root: true
  })
}
