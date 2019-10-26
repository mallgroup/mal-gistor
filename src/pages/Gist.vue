<template>
  <q-page class="q-pa-md">
    <div v-if="truncatedFileExists === true">
      <q-banner class="bg-secondary text-white">
        It is not possible to update files larger than 1mb. You should consider to work with those files as with any GIT repository.
        <template v-slot:action>
          <q-btn @click="$router.back()" flat color="white">Back</q-btn>
        </template>
      </q-banner>
    </div>
    <q-form
      v-if="truncatedFileExists === false"
      @submit="onSubmit"
      class="q-gutter-md"
    >
    <q-banner class="shadow-1">
      <div class="row">
        <div class="col" v-if="id">
          <q-btn @click="$router.back()">Back</q-btn>
        </div>
        <div class="col text-right">
          <q-btn type="submit" class="bg-primary text-white">Save</q-btn>
        </div>
      </div>
    </q-banner>

    <div class="row q-gutter-md">
        <div class="col">
          <q-btn-toggle
            :disable="id.length > 0"
            v-model="form.public"
            toggle-color="secondary"
            :options="[
              {label: 'Public', value: true},
              {label: 'Private', value: false}
            ]"
          />
          <div>
            <q-icon name="info">
              <q-tooltip>You can not change the visibility via GitHub API once configured.</q-tooltip>
            </q-icon>
          </div>
        </div>
      </div>

      <div class="row q-gutter-md">
        <div class="col">
          <q-input
            filled
            autofocus
            v-model="form.description"
            label="Description *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the Gist description.']"
          />
        </div>
      </div>

      <div class="row q-gutter-md">
        <div class="col">
          <q-select
            v-model="form.categories"
            :options="filteredCategories"
            filled
            multiple
            label="Categories"
            use-chips
            use-input
            fill-input
            input-debounce="0"
            @filter="filterCategories"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-gutter-md">
        <div class="col">
          <div v-for="gistFileId in Object.keys(gistFiles)" :key="gistFileId">
            <gist-file
              v-if="gistFiles[gistFileId].truncated === false"
              :id="gistFiles[gistFileId].id"
              :filename="gistFiles[gistFileId].filename"
              :content="gistFiles[gistFileId].content"
              :total="Object.keys(gistFiles).length"
              @remove="removeGistFile"
              @update="gistFileUpdate"
            />
          </div>

          <hr>

          <div class="q-mb-md">
            <q-btn size="sm" @click="addGistFile()">add file</q-btn>
          </div>
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import GistFile from '../components/gist-file'

export default {
  name: 'PageGist',
  components: {
    GistFile
  },
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      form: {
        description: '',
        files: {},
        public: true,
        categories: null
      },
      gistFiles: {},
      filteredCategory: '',
      truncatedFileExists: false
    }
  },

  computed: {
    categories () {
      return this.$store.state.gist.categories
    },
    filteredCategories () {
      return this.categories.map((category) => {
        return {
          label: category.category,
          value: category.id
        }
      }).filter(v => v.label.toLowerCase().indexOf(this.filteredCategory) > -1)
    },
    gistItems () {
      return this.$store.state.gist.items
    }
  },

  watch: {
    $route () {
      this.resetData()

      this.$nextTick(() => this.addGistFile())
    },

    gistItems: {
      immediate: true,
      handler (values) {
        if (Object.keys(values).length) {
          this.resetData()
          this.fetchData()
        }
      }
    }
  },

  mounted () {
    // open the first field only in case it is a new form
    if (!this.id) {
      this.addGistFile()
    }
  },
  methods: {
    resetData () {
      this.form.description = ''
      this.form.files = {}
      this.form.public = true
      this.form.categories = null
      this.gistFiles = {}
    },
    async fetchData () {
      // only in case this is an update form
      if (this.id) {
        this.$q.loading.show({
          message: 'Gathering Gist detail'
        })

        // load gist
        try {
          let response = await this.$axios.get(`/gists/${this.id}`)
          var gist = response.data

          this.form.description = gist.description
          this.form.public = gist.public

          let selectedCategories = []

          if (this.gistItems.hasOwnProperty(this.id) && this.gistItems[this.id].hasOwnProperty('categories') && Object.keys(this.gistItems[this.id].categories).length) {
            for (let categoryKey of this.gistItems[this.id].categories) {
              let foundedCategory = this.$store.getters['gist/findConfigCategoryById'](categoryKey)

              if (foundedCategory) {
                selectedCategories.push({
                  label: foundedCategory.category,
                  value: foundedCategory.id
                })
              }
            }
          }

          this.form.categories = selectedCategories

          if (Object.keys(gist.files).length) {
            for (let fileKey in gist.files) {
              this.addGistFile(gist.files[fileKey])
            }
          }
        } catch (error) {
          if (error) {
            console.error(error)
          }

          this.$q.notify({
            message: 'It is not possible to get a detail of your Gist.',
            color: 'red'
          })

          this.$router.push({ name: 'gist' })
        }

        this.$q.loading.hide()
      }
    },

    filterCategories (val, update, abort) {
      update(() => {
        this.filteredCategory = val.toLowerCase()
      })
    },

    addGistFile (file) {
      let id = ++Object.keys(this.gistFiles).length
      this.$set(this.gistFiles, id, {
        id,
        content: file.content,
        filename: file.filename,
        truncated: file.truncated
      })

      if (file.truncated) {
        this.truncatedFileExists = true
      }
    },

    removeGistFile (id) {
      var gistFile = this.gistFiles[id]
      gistFile.deleted = true

      this.$set(this.gistFiles, id, gistFile)
      this.$delete(this.gistFiles, id)
    },

    gistFileUpdate ({ type, id, value }) {
      this.gistFiles[id][type] = value
      this.$set(this.gistFiles, id, this.gistFiles[id])
    },

    async onSubmit () {
      // format files first
      for (let gistFileItem in this.gistFiles) {
        let gistFile = this.gistFiles[gistFileItem]

        if (gistFile.hasOwnProperty('deleted')) {
          this.form.files[gistFile.filename] = null
        } else {
          if (gistFile.content && gistFile.content.trim().length) {
            this.form.files[gistFile.filename] = {
              content: gistFile.content
            }
          }
        }
      }

      if (!Object.keys(this.form.files).length) {
        this.$q.notify({
          message: 'Do not forget to place a content of your Gist.',
          color: 'red'
        })
        return false
      }

      this.$q.loading.show({
        message: 'Saving your Gist'
      })

      let response = null

      try {
        response = await this.$axios[this.id ? 'patch' : 'post']('/gists' + (this.id ? `/${this.id}` : ''), {
          description: this.form.description,
          public: this.form.public,
          files: this.form.files
        })
      } catch (error) {
        if (error) {
          console.error(error)
        }

        this.$q.notify({
          message: `It is not possible to ${this.id ? 'update' : 'create'} your gist.`,
          color: 'red'
        })
      }

      if (response) {
        try {
          await this.updateConfig(response.data)
        } catch (error) {
          if (error) {
            console.error(error)
          }

          this.$q.notify({
            message: 'It is not possible to update a configuration gist.',
            color: 'red'
          })
        }
      }

      this.$q.loading.hide()
    },

    async updateConfig (gistData) {
      if (this.form.categories && this.form.categories.length) {
        gistData.categories = this.form.categories.map((category) => category.value) // just the value of the select box
      }

      try {
        if (this.id) {
          // update item
          this.$store.commit('gist/replace', gistData)
        } else {
          // new record
          this.$store.commit('gist/add', gistData)
        }

        await this.$store.dispatch('gist/updateConfig')

        this.$q.notify({
          message: 'Gist successfully created.',
          color: 'positive'
        })
      } catch (error) {
        if (error) {
          console.error(error)
        }

        this.$q.notify({
          message: 'It is not possible to update a configuration gist.',
          color: 'red'
        })
      }
    }
  }
}
</script>
