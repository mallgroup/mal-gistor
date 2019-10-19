export function config (state, config) {
  state.config = config
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

export function remove (state, gist) {
  let items = state.items.filter(item => item.id !== gist.id)
  state.items = items
}

export function clear (state) {
  state.items = []
  state.config = {}
}
