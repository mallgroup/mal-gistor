<template>
  <q-page padding>
    <gist-stats v-if="loggedIn" />
  </q-page>
</template>

<script>
import GistStats from '../components/gist-stats'

export default {
  name: 'PageIndex',
  components: {
    GistStats
  },
  computed: {
    loggedIn () {
      return this.$store.getters['user/loggedIn']
    }
  }
}
</script>
