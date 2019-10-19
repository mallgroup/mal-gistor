<template>
  <q-page>
    <div class="fixed-center text-center">
      <user-login />
    </div>
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
