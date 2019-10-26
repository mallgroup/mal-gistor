<template>
  <div class="q-ma-md">
    <hr>
    <div class="row q-gutter-sm q-mb-md">
      <div class="col-5">
        <q-input
          @input="$emit('update', { type: 'filename', id: id, value: form.filename })"
          filled
          v-model="form.filename"
          label="File Name"
          hint="file.js, file.txt etc."
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter the file name.']"
        />
      </div>
      <div class="col text-right">
        <q-btn
          v-if="total > 1"
          @click="$emit('remove', id)"
          size="sm"
          outline
          class="text-red">
          remove
        </q-btn>
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col">
        <h3 class="text-h6">
          Content
          <q-icon name="file_copy" class="cursor-pointer" @click="copyToClipboard"></q-icon>
        </h3>
        <div ref="highlight" class="highlight shadow-1">{{ form.content }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentGistFile',
  props: {
    id: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    filename: {
      type: String
    },
    content: {
      type: String
    }
  },

  data () {
    return {
      editor: null,
      modelist: null,
      modes: [],
      form: {
        filename: '',
        content: ''
      }
    }
  },

  watch: {
    'form.filename' (file) {
      const mode = this.modelist.getModeForPath(file).mode

      if (this.modes.indexOf(mode) === -1) {
        this.modes.push(mode)
      }

      this.editor.session.setMode(mode)
    }
  },

  created () {
    this.modelist = window.ace.require('ace/ext/modelist')

    if (this.filename && this.content) {
      this.form.content = this.content
      this.form.filename = this.filename
    }
  },

  mounted () {
    this.editor = window.ace.edit(this.$refs.highlight)

    this.editor.session.on('change', (delta) => {
      this.$emit('update', { type: 'content', id: this.id, value: this.editor.getValue() })
    })
  },

  destroyed () {
    this.editor.destroy()
    this.editor.container.remove()

    this.editor = null
    this.modelist = null
  },

  methods: {
    copyToClipboard () {
      this.$clipboard(this.editor.getValue())
    }
  }
}
</script>

<style lang="stylus" scoped>
  .highlight
    width 90%
    height 400px
</style>
