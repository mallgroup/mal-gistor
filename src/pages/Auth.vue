<template>
  <q-page
    class='q-pa-md'
  >
    <user-login />
  </q-page>
</template>

<script>
import UserLogin from '../components/user-login'

export default {
  name: 'PageAuth',
  components: {
    UserLogin
  }
}
</script>
