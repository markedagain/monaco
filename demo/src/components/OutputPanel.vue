<template>
  <aside class="output-panel">
    <div class="output-header">Validation</div>
    <div 
      id="problems" 
      :class="problemsClass"
    >
      {{ problems || 'Ready for validation...' }}
    </div>
    <div class="output-header">Parse Output</div>
    <div id="output">
      {{ parseOutput || 'Click "Parse SQL" to see output...' }}
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  problems: {
    type: String,
    default: ''
  },
  parseOutput: {
    type: String,
    default: ''
  }
});

const problemsClass = computed(() => {
  if (!props.problems) return 'problems';
  
  if (props.problems === 'No syntax errors') {
    return 'problems success';
  } else if (props.problems.includes('error')) {
    return 'problems error';
  }
  
  return 'problems';
});
</script>

<style scoped>
.output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #333;
  background-color: #1e1e1e;
}

.output-header {
  padding: 0.5rem;
  background-color: #333;
  color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #444;
}

.problems {
  padding: 1rem;
  white-space: pre-wrap;
  font-family: monospace;
  flex: 1;
  overflow-y: auto;
  color: #ccc;
}

.problems.success {
  color: #4ade80;
}

.problems.error {
  color: #f87171;
}

#output {
  padding: 1rem;
  white-space: pre-wrap;
  font-family: monospace;
  flex: 1;
  overflow-y: auto;
  color: #ccc;
  border-top: 1px solid #333;
}
</style>