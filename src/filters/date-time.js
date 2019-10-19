import Vue from 'vue'
import moment from 'moment'

export default Vue.filter('datetime', (date) => {
  let momentDate = moment(date)
  return momentDate.format('YYYY-MM-DD HH:mm')
})
