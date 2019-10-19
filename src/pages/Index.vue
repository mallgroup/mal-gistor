<template>
  <q-page class="q-pa-md">
    <user-login v-if="!loggedIn" />
    <gist-stats v-if="loggedIn" />
  </q-page>
</template>

<script>
import UserLogin from '../components/user-login'
import GistStats from '../components/gist-stats'

export default {
  name: 'PageIndex',
  components: {
    UserLogin,
    GistStats
  },
  computed: {
    loggedIn () {
      return this.$store.getters['user/loggedIn']
    }
  }
}
</script>
