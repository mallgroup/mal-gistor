<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          MALL Group Gist
        </q-toolbar-title>

        <a
            href="http://mallgroup.com"
            target="_blank"
            rel="noopener noreferrer"
            class="vertical-middle"
          >
          <img
            alt="MALL Group"
            src="~assets/mallgroup.svg"
            style="max-width:150px"
          >
        </a>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        <q-item clickable :to="{name: 'homepage'}" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="loggedIn" clickable :to="{name: 'all'}" exact>
          <q-item-section avatar>
            <q-icon name="view_list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>All Gists</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list v-if="loggedIn" class="q-mt-lg">
        <q-item clickable :to="{name: 'gist'}" exact>
          <q-item-section avatar>
            <q-icon color="secondary" name="add_circle" />
          </q-item-section>
          <q-item-section>
            New Gist
          </q-item-section>
        </q-item>
      </q-list>

      <q-list v-if="loggedIn" class="absolute-bottom">
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon color="tertiary" name="exit_to_app" />
          </q-item-section>
          <q-item-section>
            Logout
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false,
      category: '',
      error: {
        category: ''
      }
    }
  },

  computed: {
    loggedIn () {
      return this.$store.getters['user/loggedIn']
    }
  },

  mounted () {
    this.$store.commit('gist/removeAllItems')
    this.fetchGists()
  },

  methods: {
    async fetchGists () {
      if (!this.loggedIn) {
        return false
      }

      const configFileName = 'mallgroup-gist-config.json'
      let allGists = []

      try {
        this.$q.loading.show({
          message: 'Gathering all gists'
        })

        let response = await this.$axios.get('/gists')

        if (response.data.length) {
          allGists = response.data
          var configGistId = ''

          // search for configuration gist
          for (let gist of allGists) {
            if (Object.keys(gist.files).indexOf(configFileName) > -1) {
              configGistId = gist.id
              break
            }
          }
        }
      } catch (error) {
        if (error) {
          console.error(error)
        }

        this.$q.notify({
          message: 'It is not possible to get your gists.',
          color: 'red'
        })
      }

      if (configGistId) {
        // get content of the config file
        try {
          let response = await this.$axios.get(`/gists/${configGistId}`)

          this.$store.commit('gist/config', {
            id: configGistId,
            truncated: response.data.files[configFileName].truncated,
            size: response.data.files[configFileName].size,
            ...JSON.parse(response.data.files[configFileName].content) // append config from content
          })
        } catch (error) {
          if (error) {
            console.error(error)
          }

          this.$q.notify({
            message: 'It is not possible to read a gist that holds a configuration.',
            color: 'red'
          })
        }
      } else {
        // create a config file first
        try {
          let files = {}
          files[configFileName] = {
            content: JSON.stringify({
              items: [],
              categories: []
            })
          }

          await this.$axios.post('/gists', {
            public: false,
            description: configFileName,
            files
          })
        } catch (error) {
          if (error) {
            console.error(error)
          }
        }
      }

      if (allGists.length) {
        for (let gist of allGists) {
          // ignore configuration file
          if (gist.description !== configFileName) {
            this.$store.commit('gist/add', gist)
          }
        }
      }

      this.$q.loading.hide()
    },

    logout () {
      this.$q.notify({
        message: 'Bye. We are looking forward to see you again.',
        color: 'positive'
      })

      this.$store.dispatch('user/logout')

      this.$router.push({ name: 'auth' })
    }
  }
}
</script>
