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
  state.items.push(gist)
}

export function prepend (state, gist) {
  state.items.unshift(gist)
}

export function replace (state, gist) {
  state.items = state.items.map(item => {
    if (item.id === gist.id) {
      item = gist
    }

    return item
  })
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
