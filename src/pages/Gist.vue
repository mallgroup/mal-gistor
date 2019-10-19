<template>
  <q-page class="q-pa-md">
    <q-form
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
          <div v-for="gistFileId in Object.keys(gistFiles)" :key="gistFileId">
            <gist-file
              :id="gistFiles[gistFileId].id"
              :filename="gistFiles[gistFileId].filename"
              :content="gistFiles[gistFileId].content"
              @remove="removeGistFile"
              @update="gistFileUpdate"
            />
          </div>

          <div class="q-mb-md">
            <q-btn size="sm" @click="addGistFile()">add other file</q-btn>
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
        public: true
      },
      fileVisible: false,
      gistFiles: {}
    }
  },
  async created () {
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

        if (Object.keys(gist.files).length) {
          for (let fileKey in gist.files) {
            let file = gist.files[fileKey]
            this.addGistFile(file.filename, file.content)
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
      }

      this.$q.loading.hide()
    }
  },
  mounted () {
    // open the first field only in case it is a new form
    if (!this.id) {
      this.addGistFile()
    }
  },
  methods: {
    addGistFile (filename, content) {
      let id = ++Object.keys(this.gistFiles).length
      this.$set(this.gistFiles, id, {
        id,
        content,
        filename
      })
    },

    removeGistFile (id) {
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

        if (gistFile.content && gistFile.content.trim().length) {
          this.form.files[gistFile.filename] = {
            content: gistFile.content
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
      let config = JSON.parse(JSON.stringify(this.$store.state.gist.config))

      if (typeof config.items[gistData.id] === 'undefined') {
        config.items[gistData.id] = {}
      }

      config.items[gistData.id] = {
        id: gistData.id,
        categories: []
      }

      console.log(this.$store.state.gist.config)

      try {
        let patchData = {
          description: config.description,
          files: {
            'mallgroup-gist-config.json': {
              content: JSON.stringify(this.$store.state.gist.config),
              filename: 'mallgroup-gist-config.json'
            }
          }
        }

        await this.$axios.patch(`/gists/${config.id}`, patchData)

        this.$store.commit('gist/config', config)

        if (this.id) {
          // update item
          this.$store.commit('gist/replace', gistData)
        } else {
          // new record
          this.$store.commit('gist/prepend', gistData)
        }

        this.$q.notify({
          message: 'Gist successfully created.',
          color: 'positive'
        })

        return this.$router.push({
          name: 'all'
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

      // redirect to gist detail
      this.$router.push({ name: 'gist', params: { id: gistData } })
    }
  }
}
</script>
