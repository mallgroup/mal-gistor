<template>
  <div v-if="!gistLoading">
    <q-banner class="bg-primary text-white q-mt-md q-mb-md" v-if="gistCount === 0">
      Currently you don't have any Gist we can count some stats from.
      <template v-slot:action>
        <q-btn flat color="white" label="create a first one" @click="$router.push({ name: 'gist' })" />
      </template>
    </q-banner>

    <div class="row">
      <div class="col-xs-12 col-md-6">
        <div class="row">
          <div class="col-12">
            <h2 class="text-h6">
              Gist you have
              <q-badge color="primary">
                {{ gistCount }}
              </q-badge>
            </h2>
          </div>
          <div class="col-6">
            <h2 class="text-h6">
              Storage (1Mb)
            </h2>
            <div>
              <q-knob
                v-model="storageFull"
                size="120px"
                font-size="16px"
                track-color="orange-2"
                :thickness="0.6"
                color="orange"
                center-color="orange-10"
                show-value
                readonly
              >
                {{ storageFull }}%
              </q-knob>
            </div>
            <div>
              <small>
                <q-icon name="info" />
                <em>
                  <a :href="`https://gist.github.com/${$store.state.gist.configId}`" target="_blank">Configuration file</a> might only have 1Mb.
                </em>
              </small>
            </div>
          </div>
          <div class="col-6">
            <h2 class="text-h6">
              Rate Limit
            </h2>
            <div>
              <q-knob
                v-model="rateLimit"
                size="120px"
                font-size="16px"
                track-color="orange-2"
                :thickness="0.6"
                color="orange"
                center-color="orange-10"
                show-value
                readonly
              >
                {{ rateLimit }}%
              </q-knob>
            </div>
            <div>
              <small>
                <q-icon name="info" />
                <em>
                  You have {{ rate.limit }} requests for GitHub API.
                </em>
              </small>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <template v-if="gistsByLanguage.length > 0">
          <h2 class="text-h6">
            Languages you like
          </h2>

          <q-list bordered separator>
            <q-item v-for="language in gistsByLanguage" :key="language.languge">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ language.count }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                {{ language.language }}
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentGistStats',
  computed: {
    gistCount () {
      return this.$store.getters['gist/count']
    },
    gistsByLanguage () {
      return this.$store.getters['gist/groupByLanguage']
    },
    storageFull () {
      return Math.round(this.$store.state.gist.size / 1024) || 0
    },
    gistLoading () {
      return this.$store.state.gist.loading
    },
    rate () {
      return this.$store.state.rate
    },
    rateLimit () {
      return 100 - Math.round(this.$store.state.rate.remaining / this.$store.state.rate.limit * 100)
    }
  }
}
</script>
