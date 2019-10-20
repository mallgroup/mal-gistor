<template>
  <q-page class="q-pa-md">
    <h2 class="text-h4" v-if="categoryId && categoryName(categoryId)">
      Gists listed in:
    </h2>
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
      gists: [],
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
    gistsInStore () {
      return this.$store.getters['gist/filterGistsByCategory'](this.categoryId)
    }
  },
  watch: {
    // I can't use Vuex and computed property.
    // Quasar Table mutates the object and Vuex complains about it.
    // So I'm using this watch and fetchData method every time I'm manipulating with the store on this page.
    gistsInStore: {
      immediate: true,
      handler () {
        this.fetchData()
      }
    }
  },
  methods: {
    fetchData () {
      this.gists = Object.values(this.$store.getters['gist/filterGistsByCategory'](this.categoryId))
    },

    categoryName (catId) {
      return this.$store.getters['gist/findConfigCategoryById'](catId)
    },

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
            this.$store.dispatch('gist/remove', gist)
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

        this.fetchData()

        this.selected = []
      }).onCancel(() => {
        // nothing here
      }).onDismiss(() => {
        // nothing here
      })
    }
  }
}
</script>
