<template>
  <div class="app">
    <ColorButton
      v-for="(color, index) in colors"
      :key="index"
      :color="color"
      @change-color="setBackgroundColor"
    >
      Change to {{ color }}
    </ColorButton>
  </div>
</template>

<script>
import ColorButton from './components/ColorButton.vue';
export default {
  name: 'App',
  components: {
    ColorButton,
  },
  data() {
    return {
      colors: ['Black', 'Red', 'Blue', 'Green', 'Purple', 'Orange', 'White'],
    };
  },
  methods: {
    setBackgroundColor(color) {
      document.body.style.backgroundColor = color;
    },
  },
};
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}
</style>