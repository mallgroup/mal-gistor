import Vue from 'vue'
import filesize from 'filesize'

export default Vue.filter('filesize', (size) => {
  return filesize(size)
})
