<template>
  <q-page class="q-pa-md">
    <q-table
      :data="gists"
      :columns="columns"
      row-key="id"
      no-data-label="You don't have any gists yet."
      :pagination="pagination"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
    >
    <template v-slot:top>
      <template v-if="selected.length > 0">
        <q-btn flat dense color="red" label="Delete" @click="remove" />
      </template>

      <q-space />

      <q-input borderless dense debounce="300" color="primary" v-model="filter" placeholder="search...">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template v-slot:body-cell-created_at="props">
        <q-td key="created_at" :props="props">
          {{ props.row.created_at | datetime }}
        </q-td>
    </template>
    <template v-slot:body-cell-description="props">
      <q-td key="description" :props="props" :auto-width="false" :style="{'max-width': '300px', whiteSpace: 'normal'}">
        <router-link :to="{name: `gist`, params: {id: props.row.id}}">{{ props.row.description }}</router-link>
        <div v-if="props.row.public === false">
          <q-icon name="vpn_key" />
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-updated_at="props">
        <q-td key="updated_at" :props="props">
          {{ props.row.updated_at | datetime }}
        </q-td>
    </template>
    <template v-slot:body-cell-files="props">
        <q-td key="files" :props="props">
          <div v-for="(file, key) in props.row.files" :key="key" class="row q-mb-sm">
            <div class="col" :style="{'max-width': '100px', whiteSpace: 'normal'}">
              {{ file.filename }}
            </div>
            <div class="col">
              <q-badge v-if="file.language" color="blue" class="q-mr-sm">{{ file.language }}</q-badge>
              <q-badge color="accent">{{ file.size | filesize }}</q-badge>
            </div>
          </div>
        </q-td>
    </template>
    </q-table>
  </q-page>
</template>

<script>
import DateTime from '../filters/date-time'
import FileSize from '../filters/file-size'

export default {
  name: 'PageAll',
  filters: {
    DateTime,
    FileSize
  },
  props: {
    categoryId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      pagination: {
        rowsPerPage: 100
      },
      selected: [],
      filter: '',
      columns: [
        {
          name: 'description',
          field: 'description',
          label: 'Description',
          required: true,
          align: 'left'
        },
        {
          name: 'files',
          field: 'files',
          label: 'Files',
          required: true,
          align: 'left'
        },
        {
          name: 'created_at',
          field: 'created_at',
          label: 'Created',
          required: true,
          align: 'left',
          sortable: true
        },
        {
          name: 'updated_at',
          field: 'updated_at',
          label: 'Updated',
          required: true,
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  computed: {
    gists () {
      return this.$store.getters['gist/filterGistsByCategory'](this.categoryId)
    }
  },
  methods: {
    async remove () {
      this.$q.dialog({
        title: 'Delete Gist',
        message: 'Are you sure you want to delete selected Gists?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        for (let gist of this.selected) {
          try {
            await this.$axios.delete(`gists/${gist.id}`)
            await this.removeFromConfig(gist)
          } catch (error) {
            if (error) {
              console.error(error)
            }

            this.$q.notify({
              message: 'It is not possible to delete a gist.',
              color: 'red'
            })
          }
        }
      }).onCancel(() => {
        // nothing here
      }).onDismiss(() => {
        // nothing here
      })
    },

    async removeFromConfig (gist) {
      for (let gist of this.selected) {
        try {
          this.$store.commit('gist/remove', gist)

          // remove gist from configuration file
          let configuration = JSON.parse(JSON.stringify(this.$store.state.gist.config))

          let configItems = {}

          for (let configItemKey in configuration.items) {
            if (configuration.items[configItemKey].id !== gist.id) {
              configItems[configuration.items[configItemKey].id] = configuration.items[configItemKey]
            }
          }

          configuration.items = configItems

          this.$store.commit('gist/config', configuration)

          let patchData = {
            description: configuration.description,
            files: {
              'mallgroup-gist-config.json': {
                content: JSON.stringify(this.$store.state.gist.config),
                filename: 'mallgroup-gist-config.json'
              }
            }
          }

          await this.$axios.patch(`gists/${configuration.id}`, patchData)
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

      this.selected = []
    }
  }
}
</script>
