<template>
  <div>
    <q-banner class="bg-primary text-white q-mt-md q-mb-md" v-if="gistsByLanguage.length === 0">
      Currently you don't have any Gist we can count some stats from.
      <template v-slot:action>
        <q-btn flat color="white" label="create a first one" @click="$router.push({ name: 'gist' })" />
      </template>
    </q-banner>

    <q-card
      v-if="gistCount"
      class="my-card text-white"
      style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
    >
      <q-card-section>
        <div class="text-h6">
          On your account
          <q-badge color="primary">
            {{ gistCount }}
          </q-badge>
        </div>
      </q-card-section>
    </q-card>

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
    }
  }
}
</script>
