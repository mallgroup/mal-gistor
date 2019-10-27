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
           Gistor
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
            class="vertical-middle"
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
        <q-item clickable @click="categoryDialog({ mode: 'create' })">
          <q-item-section avatar>
            <q-icon color="accent" name="create_new_folder" />
          </q-item-section>
          <q-item-section>
            New Category
          </q-item-section>
        </q-item>
      </q-list>

      <q-list dense class="categories">
        <q-item-label header>Categories</q-item-label>
        <template
          v-if="loggedIn"
        >
          <q-item clickable :to="{name: 'all'}" exact>
            <q-item-section avatar>
              <q-icon name="view_list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>All Gists</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-for="category in categories" :key="category.id"
            :to="{name: 'all', params: { categoryId: category.id }}"
            @mouseover="toggleMenuEditIcon(category.id, true)"
            @mouseleave="toggleMenuEditIcon(category.id, false)"
            clickable
            exact
          >
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ category.category }}</q-item-label>
            </q-item-section>

            <q-item-section side v-show="editOption[category.id] === false">
              {{ totalByCategory(category) }}
            </q-item-section>

            <q-item-section side @click.native="openUpdateDialog({ category, mode: 'update' }, $event)" v-show="editOption[category.id] === true">
              <q-icon name="edit" />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <q-list v-if="loggedIn" class="absolute-bottom">
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon v-if="!avatarUrl" color="tertiary" name="exit_to_app" />
            <q-avatar v-if="avatarUrl">
              <img :src="avatarUrl" alt="avatar">
            </q-avatar>
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
import { map as _map } from 'lodash'

export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false,
      category: '',
      error: {
        category: ''
      },
      editOption: {},
      categoryNameValue: ''
    }
  },

  computed: {
    loggedIn () {
      return this.$store.getters['user/loggedIn']
    },
    categories () {
      return this.$store.state.gist.categories || []
    },
    avatarUrl () {
      return this.$store.state.user.avatarUrl
    }
  },

  async mounted () {
    this.$store.commit('gist/removeAllItems')
    this.fetchGists()
    this.fetchRateLimit()
    this.fetchUser()
  },

  methods: {
    async fetchRateLimit () {
      try {
        let response = await this.$axios.get('/rate_limit')
        let core = response.data.resources.core

        this.$store.commit('rate/limit', core.limit)
        this.$store.commit('rate/remaining', core.remaining)
        this.$store.commit('rate/reset', core.reset)
      } catch (error) {
        if (error) {
          console.error(error)
        }
      }
    },
    async fetchUser () {
      try {
        let response = await this.$axios.get('/user')
        this.$store.commit('user/avatarUrl', response.data.avatar_url)
      } catch (error) {
        if (error) {
          console.error(error)
        }
      }
    },
    async fetchGists () {
      if (!this.loggedIn) {
        return false
      }

      let allGists = []

      try {
        this.$store.commit('gist/loading')

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
          let configuration = JSON.parse(response.data.files[CONFIG_FILE_NAME].content)
          let allGistsIds = allGists.map((gist) => gist.id)

          for (let gist of allGists) {
            if (typeof configuration.items[gist.id] !== 'undefined') {
              configuration.items[gist.id].files = gist.files
              configuration.items[gist.id].description = gist.description
              configuration.items[gist.id].created_at = gist.created_at
              configuration.items[gist.id].updated_at = gist.updated_at
              configuration.items[gist.id].public = gist.public
            }
          }

          // remove items in configuration object that does not exists on real gists
          for (let key in configuration.items) {
            if (allGistsIds.indexOf(key) === -1) {
              delete configuration.items[key]
            }
          }

          this.$store.commit('gist/configId', configGistId)
          this.$store.commit('gist/items', configuration.items)
          this.$store.commit('gist/categories', configuration.categories)
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
          let items = {}
          let categories = []

          for (let gist of allGists) {
            items[gist.id] = {
              id: gist.id,
              categories: []
            }
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

          configGistId = response.data.id

          for (let gist of allGists) {
            if (typeof items[gist.id] !== 'undefined') {
              items[gist.id].files = gist.files
              items[gist.id].description = gist.description
              items[gist.id].created_at = gist.created_at
              items[gist.id].updated_at = gist.updated_at
              items[gist.id].public = gist.public
            }
          }

          this.$store.commit('gist/items', items)
          this.$store.commit('gist/categories', categories)

          this.$store.commit('gist/size', response.data.files[CONFIG_FILE_NAME].size)
          this.$store.commit('gist/truncated', response.data.files[CONFIG_FILE_NAME].truncated)
        } catch (error) {
          if (error) {
            console.error(error)
          }
        }
      }

      this.$store.commit('gist/configId', configGistId)

      this.$store.commit('gist/loading')

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

    categoryDialog ({ category, mode }) {
      this.$q.dialog({
        title: 'Category',
        message: 'Enter the category name:',
        prompt: {
          model: (category ? category.category : ''),
          type: 'text'
        },
        cancel: true,
        persistent: false
      }).onOk(async categoryModel => {
        if (!categoryModel.trim().length) {
          this.$q.notify({
            message: 'Please enter the name of the category.',
            color: 'red'
          })

          return false
        }

        let categories = JSON.parse(JSON.stringify(this.$store.state.gist.categories))

        if (mode === 'create') {
          // new category
          categories.push({
            id: this.$uuid(),
            category: categoryModel
          })
        }

        if (mode === 'update') {
          // update category
          categories = _map(categories, (cat) => {
            if (cat.id === category.id) {
              cat.category = categoryModel
            }

            return cat
          })
        }

        this.$store.commit('gist/categories', categories)
        await this.$store.dispatch('gist/updateConfig')
      }).onCancel(() => {
        // do nothing here
      }).onDismiss(() => {
        // do nothing here
      })
    },

    async openUpdateDialog ({ category, mode }, $event) {
      $event.stopPropagation()
      $event.preventDefault()

      this.categoryDialog({
        category,
        mode: 'update'
      })
    },

    totalByCategory (category) {
      try {
        return this.$store.getters['gist/filterGistsByCategory'](category.id).length
      } catch (error) {
        if (error) {
          // do nothing here
        }
      }

      return 0
    },

    toggleMenuEditIcon (catId, state) {
      this.$set(this.editOption, catId, state)
    }
  }
}
</script>

<style lang="stylus" scoped>
  .categories
    max-height 500px
    overflow-y auto
</style>
