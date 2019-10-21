<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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
            style="max-width:150px;"
          >
        </a>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',

  computed: {
    loggedIn () {
      return this.$store.getters['user/loggedIn']
    }
  }
}
</script>
