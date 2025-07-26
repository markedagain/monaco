<template>
  <div class="language-selector-wrapper">
    <label for="language-selector">Language:</label>
    <select 
      id="language-selector"
      :value="currentLanguage"
      @change="handleChange"
    >
      <option 
        v-for="language in languages" 
        :key="language"
        :value="language"
      >
        {{ language }}
      </option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  languages: {
    type: Array,
    required: true
  },
  currentLanguage: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['language-changed']);

function handleChange(event) {
  emit('language-changed', event.target.value);
}
</script>

<style scoped>
.language-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>