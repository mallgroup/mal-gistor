<template>
  <div>
    <div class="row">
      <div class="col">
        <p>
          Enter your GitHub personal access token. You might found your token on
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            your profile page</a>.
          <br />
          If you do not have any personal access token yet you might
          <a
            href="https://github.com/settings/tokens/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            create a new one
          </a>.
        </p>
      </div>
    </div>
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
      autofocus
    >
      <div class="row">
        <div class="col-6">
          <q-input
            filled
            v-model="user"
            label="Username"
            :rules="[val => !!val || 'Username is required.']"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <q-input
            filled
            v-model="token"
            label="Token"
            :rules="[val => !!val || 'Personal access token is required.']"
          />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <q-btn type="submit">Authorize</q-btn>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
export default {
  name: 'ComponentPersonalToken',
  data () {
    return {
      user: '',
      token: ''
    }
  },
  mounted () {
    this.user = this.$store.state.user.user
    this.token = this.$store.state.user.token
  },
  methods: {
    async onSubmit () {
      this.$q.loading.show({
        message: 'Authorizing...'
      })

      try {
        await this.$axios.get('/user', {
          auth: {
            username: this.user || '',
            password: this.token || ''
          }
        })

        this.$q.notify({
          message: 'Welcome back!',
          color: 'positive'
        })

        this.$store.commit('user/token', this.token)
        this.$store.commit('user/user', this.user)

        setTimeout(() => {
          window.location.reload()
        }, 500)
      } catch (err) {
        if (err) {
          if (err.request.status === 401) {
            // authorization failed
            this.$q.notify({
              message: 'Authorization failed. Please check your credentials.',
              color: 'red'
            })
          } else {
            console.error(err)
          }
        }
      }

      this.$q.loading.hide()
    }
  }
}
</script>
