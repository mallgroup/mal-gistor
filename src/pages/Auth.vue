<template>
  <q-page>
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
