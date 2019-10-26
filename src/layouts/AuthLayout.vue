<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
      <div class="fixed-bottom-right q-ma-md">
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
            class="vertical-middle"
          >
        </a>
      </div>
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
