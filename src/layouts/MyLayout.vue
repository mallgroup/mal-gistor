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
           Gist UI
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

        <template v-if="loggedIn">
          <q-item
            v-for="category in categories" :key="category.id"
            :to="{name: 'all', params: { categoryId: category.id }}"
            clickable
            exact
          >
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ category.category }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable :to="{name: 'all'}" exact>
            <q-item-section avatar>
              <q-icon name="view_list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>All Gists</q-item-label>
            </q-item-section>
          </q-item>
        </template>
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
        <q-item clickable @click="newCategoryDialog">
          <q-item-section avatar>
            <q-icon color="accent" name="create_new_folder" />
          </q-item-section>
          <q-item-section>
            New Category
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
import { CONFIG_FILE_NAME } from '../boot/axios'

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
    },

    categories () {
      return this.$store.state.gist.config.categories || []
    }
  },

  async mounted () {
    this.$store.commit('gist/removeAllItems')
    this.fetchGists()
  },

  methods: {
    async fetchGists () {
      if (!this.loggedIn) {
        return false
      }

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
            if (Object.keys(gist.files).indexOf(CONFIG_FILE_NAME) > -1) {
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
            ...JSON.parse(response.data.files[CONFIG_FILE_NAME].content) // append config from content
          })

          this.$store.commit('gist/size', response.data.files[CONFIG_FILE_NAME].size)
          this.$store.commit('gist/truncated', response.data.files[CONFIG_FILE_NAME].truncated)
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
        // create a config file first and sync all
        try {
          let files = {}
          let items = []
          let categories = []

          for (let gist of allGists) {
            items.push({
              id: gist.id,
              categories: []
            })
          }

          files[CONFIG_FILE_NAME] = {
            content: JSON.stringify({
              items,
              categories
            })
          }

          let response = await this.$axios.post('/gists', {
            public: false,
            description: CONFIG_FILE_NAME,
            files
          })

          let config = JSON.parse(JSON.stringify(this.$store.state.gist.config))
          config.id = response.data.id
          config.items = items

          this.$store.commit('gist/config', config)
          this.$store.commit('gist/size', response.data.files[CONFIG_FILE_NAME].size)
          this.$store.commit('gist/truncated', response.data.files[CONFIG_FILE_NAME].truncated)
        } catch (error) {
          if (error) {
            console.error(error)
          }
        }
      }

      if (allGists.length) {
        for (let gist of allGists) {
          // ignore configuration file
          if (gist.description !== CONFIG_FILE_NAME) {
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
    },

    newCategoryDialog () {
      this.$q.dialog({
        title: 'Category',
        message: 'Enter the category name:',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true,
        persistent: false
      }).onOk(async category => {
        if (!category.trim().length) {
          this.$q.notify({
            message: 'Please enter the name of the category.',
            color: 'red'
          })

          return false
        }

        let config = JSON.parse(JSON.stringify(this.$store.state.gist.config))
        config.categories.push({
          id: this.$uuid(),
          category
        })

        await this.$store.dispatch('gist/updateConfig', config)
      }).onCancel(() => {
        // do nothing here
      }).onDismiss(() => {
        // do nothing here
      })
    }
  }
}
</script>
