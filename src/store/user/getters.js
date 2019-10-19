export function loggedIn (state) {
  return state.user.length > 0 && state.token.length > 0
}
