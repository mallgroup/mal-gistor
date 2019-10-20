import uuidv1 from 'uuid/v1'

export default ({ Vue }) => {
  Vue.prototype.$uuid = uuidv1
}
