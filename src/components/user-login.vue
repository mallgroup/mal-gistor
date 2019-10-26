<template>
  <div class="q-ma-lg">
    <div class="row justify-center">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-5">
        <div class="row">
          <div class="col">
            <q-form
              @submit="onSubmit"
              class="q-gutter-md"
            >
              <div class="row">
                <div class="col-xs-12 text-center q-mb-md">
                  <q-icon name="lock" style="font-size: 500%"></q-icon>
                </div>
                <div class="col-12">
                  <div class="row">
                    <div class="col-12">
                      <q-input
                        filled
                        autofocus
                        v-model="token"
                        label="Personal Access Token"
                        :rules="[val => !!val || 'Please enter your GitHub personal access token.']"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 q-mt-md">
                  <q-btn
                    type="submit"
                    :disable="!token"
                  >
                    Authorize
                  </q-btn>
                </div>
              </div>
            </q-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentPersonalToken',
  data () {
    return {
      token: ''
    }
  },
  mounted () {
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
            password: this.token || ''
          }
        })

        this.$q.notify({
          message: 'Welcome back!',
          color: 'positive'
        })

        this.$store.commit('user/token', this.token)
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

      setTimeout(() => {
        this.$q.loading.hide()
      }, 500)

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }
}
</script>
