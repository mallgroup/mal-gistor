export default ({ router, store, Vue }) => {
  router.beforeEach((to, from, next) => {
    if (store.getters['user/loggedIn']) {
      if (to.name === 'auth') {
        return next({ name: 'homepage' })
      }
    } else {
      if (to.name === 'error.404') {
        return next()
      }

      if (to.name !== 'auth') {
        return next({ name: 'auth' })
      }
    }
    return next()
  })
}
