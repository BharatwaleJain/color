<template>
  <div class="color-box" :style="{ backgroundColor: currentColor }">
    <div class="btn-group">
      <ColorButton
        v-for="(clr, i) in colors"
        :key="i"
        :color="clr"
        @change-color="currentColor = clr.toLowerCase()"
      >
        Switch to {{ clr }}
      </ColorButton>
    </div>
  </div>
</template>

<script>
import ColorButton from '@/components/ColorButton.vue'
import { useToast } from 'vue-toastification'
export default {
  name: 'Color',
  components: { ColorButton },
  data() {
    return {
      colors: ['Black', 'Red', 'Blue', 'Green', 'Purple', 'Orange', 'White'],
      currentColor: '#ffffff'
    }
  },
  watch: {
    currentColor(col) {
      useToast()(`Background changed to ${col}`, { timeout: 2000 })
    }
  }
}
</script>

<style scoped>
.color-box {
  height: 75vh;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  transition: box-shadow .3s ease;
}
.color-box:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.btn-group button {
  padding: .75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: transform .2s ease, box-shadow .2s ease;
}
.btn-group button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
</style>