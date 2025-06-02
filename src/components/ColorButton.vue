<template>
  <button
    :style="{ backgroundColor: '#000', color: '#fff', padding: '1em 2em', borderRadius: '8px', cursor: 'pointer', margin: '0.5em' }"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'ColorButton',
  props: {
    color: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleClick() {
      this.$emit('change-color', this.color);
    },
  },
};
</script>