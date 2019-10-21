import { pick as _pick } from 'lodash'

export function loading (state) {
  state.loading = !state.loading
}

export function configId (state, configId) {
  state.configId = configId
}

export function items (state, items) {
  state.items = items
}

export function categories (state, categories) {
  state.categories = categories
}

export function size (state, size) {
  state.size = size
}

export function truncated (state, truncated) {
  state.truncated = truncated
}

export function add (state, gist) {
  let updatedGist = _pick(gist, ['id', 'description', 'categories', 'files'])

  state.items[gist.id] = updatedGist
}

export function replace (state, gist) {
  let items = {}
  Object.keys(state.items).forEach((key) => {
    if (key === gist.id) {
      items[key] = _pick(gist, ['id', 'description', 'categories', 'files'])
    } else {
      items[key] = state.items[key]
    }
  })

  state.items = items
}

export function removeAllItems (state) {
  state.items = []
}

export function clear (state) {
  state.items = {}
  state.categories = []
  state.size = 0
  state.truncated = false
}
