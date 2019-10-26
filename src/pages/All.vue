<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h2 class="text-h4">
          Gists listed in:
          <template v-if="categoryId && categoryName(categoryId)">
            {{ categoryName(categoryId).category }}
          </template>
          <template v-else>
            all
          </template>
        </h2>
      </div>
      <div v-if="categoryId" class="col text-right">
        <q-btn size="sm" @click="removeCategory" color="red">remove category</q-btn>
      </div>
    </div>

    <q-table
      :dense="$q.screen.lt.md"
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
          <q-icon name="settings_applications" style="font-size: 150%" class="q-mr-sm cursor-pointer">
            <q-menu
              persistent
              @before-show="fillModelCategories(props.row)"
              max-width="250px"
            >
              <q-select
                v-model="form.categories[props.row.id]"
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

              <q-separator />

              <div>
                <q-list>
                  <q-item clickable>
                    <q-item-section>
                      URL
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>
                    <q-menu anchor="top right" self="top left">
                      <q-list>
                        <q-item clickable @click="copyLinkToGist(props.row)" v-close-popup>
                          <q-item-section avatar>
                            <q-icon name="file_copy" />
                          </q-item-section>
                          <q-item-section>
                            Copy Link
                          </q-item-section>
                        </q-item>
                        <q-item clickable @click="openGistInNewWindow(props.row)" v-close-popup>
                          <q-item-section avatar>
                            <q-icon name="near_me" />
                          </q-item-section>
                          <q-item-section>
                            Open on GitHub
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item>
                </q-list>
              </div>

              <q-separator />

              <q-btn-group spread>
                <q-btn v-close-popup>Close</q-btn>
                <q-btn
                  v-close-popup
                  class="bg-secondary text-white"
                  @click="saveCategory(props.row)"
                >Save</q-btn>
              </q-btn-group>
            </q-menu>
          </q-icon>

          <router-link :to="{name: `gist`, params: {id: props.row.id}}">{{ props.row.description }}</router-link>

          <q-icon name="vpn_key" class="q-ml-sm" v-if="props.row.public === false">
            <q-tooltip>
              Gist is private.
            </q-tooltip>
          </q-icon>

          <div>
            <q-badge v-for="categoryId in props.row.categories" :key="categoryId" class="q-mr-sm" color="grey">
              {{ categoryName(categoryId).category }}
            </q-badge>
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
              <q-badge color="blue" class="q-mr-sm">
                <template v-if="file.language">{{ file.language }}</template>
                <template v-else>other</template>
              </q-badge>
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
      gistUrl: 'https://gist.github.com/',
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
      ],
      filteredCategory: '',
      form: {
        // there is an object but the category model in store is an array
        categories: {}
      }
    }
  },
  computed: {
    gistsInStore () {
      return this.$store.getters['gist/filterGistsByCategory'](this.categoryId)
    },
    categories () {
      return this.$store.state.gist.categories
    },
    filteredCategories () {
      if (this.categories) {
        return this.categories.map((category) => {
          return {
            label: category.category,
            value: category.id
          }
        }).filter(v => v.label.toLowerCase().indexOf(this.filteredCategory) > -1)
      }

      return this.categories
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
    },

    async removeCategory () {
      this.$q.dialog({
        title: 'Remove category',
        message: 'Are you sure you want to remove this category? Your Gists will remain intact.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$store.dispatch('gist/removeCategory', this.categoryId)

          this.$q.notify({
            message: 'Category deleted.',
            color: 'positive'
          })

          this.$router.push({
            name: 'all'
          })
        } catch (error) {
          if (error) {
            console.error(error)
          }

          this.$q.notify({
            message: 'It is not possible to delete this category.',
            color: 'red'
          })
        }
      }).onCancel(() => {
        // nothing here
      }).onDismiss(() => {
        // nothing here
      })
    },

    filterCategories (val, update, abort) {
      update(() => {
        this.filteredCategory = val.toLowerCase()
      })
    },

    fillModelCategories (row) {
      this.$set(this.form.categories, row.id, row.categories.map((categoryId) => {
        let category = this.categoryName(categoryId)

        return {
          label: category.category,
          value: category.id
        }
      }))
    },

    saveCategory (row) {
      try {
        let items = JSON.parse(JSON.stringify(this.$store.state.gist.items))
        items[row.id].categories = this.form.categories[row.id].map((category) => category.value)
        this.$store.commit('gist/items', items)

        this.$store.dispatch('gist/updateConfig')
      } catch (error) {
        if (error) {
          console.error(error)
        }
      }
    },

    copyLinkToGist (row) {
      this.$clipboard(this.gistUrl + row.id)
    },

    openGistInNewWindow (row) {
      window.open(this.gistUrl + row.id)
    }
  }
}
</script>
