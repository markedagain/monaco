<template>
  <div id="editor-container" ref="editorContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';

const props = defineProps({
  language: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['content-changed']);

const editorContainer = ref(null);
let editor = null;

onMounted(() => {
  if (!editorContainer.value) return;

  editor = monaco.editor.create(editorContainer.value, {
    value: '',
    language: props.language.toLowerCase(),
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    suggest: {
      snippetsPreventQuickSuggestions: false
    }
  });

  editor.onDidChangeModelContent(() => {
    emit('content-changed');
  });
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage.toLowerCase());
    }
  }
});

function getValue() {
  return editor ? editor.getValue() : '';
}

defineExpose({
  getValue
});
</script>