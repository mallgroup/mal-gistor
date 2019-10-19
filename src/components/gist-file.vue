<template>
  <div class="q-ma-md">
    <div class="row q-mb-md">
      <div class="col-5">
        <q-input
          @input="$emit('update', { type: 'filename', id: id, value: form.filename })"
          filled
          v-model="form.filename"
          label="File Name"
          hint="file.js, file,txt etc."
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please enter the file name.']"
        />
      </div>
      <div v-if="id > 1" class="col text-right">
        <q-btn @click="$emit('remove', id)" size="sm" class="bg-red text-white">remove</q-btn>
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col">
        <h3 class="text-h6">Content</h3>
        <div ref="highlight" class="highlight shadow-1">{{ form.content }}</div>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
import * as ace from 'brace'
// import 'brace/mode/javascript'

export default {
  name: 'ComponentGistFile',
  props: {
    id: {
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
      form: {
        filename: '',
        content: ''
      }
    }
  },

  created () {
    if (this.filename && this.content) {
      this.form.content = this.content
      this.form.filename = this.filename
    }
  },

  mounted () {
    this.editor = ace.edit(this.$refs.highlight)
    // this.editor.getSession().setMode('ace/mode/javascript')

    this.editor.session.on('change', (delta) => {
      this.$emit('update', { type: 'content', id: this.id, value: this.editor.getValue() })
    })
  },

  destroyed () {
    this.editor.destroy()
    this.editor.container.remove()

    this.editor = null
  }
}
</script>

<style lang="stylus" scoped>
  .highlight
    width 90%
    height 400px
</style>
