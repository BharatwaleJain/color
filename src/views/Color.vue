<template>
  <div class="app">
    <ColorButton v-for="(color, index) in colors" :key="index" :color="color" @change-color="setBackgroundColor">
      Change to {{ color }}
    </ColorButton>
  </div>
</template>

<script>
import ColorButton from '../components/ColorButton.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
};
export default {
  name: 'Color',
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
      toast(`Switching background to ${color}`, toastOptions);
    },
  },
};
</script>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;    /* Corrected */
  gap: 0.6rem;
}
</style>