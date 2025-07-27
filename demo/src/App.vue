<template>
  <div class="container">
    <header class="header">
      <div class="controls">
        <LanguageSelector 
          :languages="languages"
          :currentLanguage="currentLanguage"
          @language-changed="handleLanguageChange"
        />
        <button @click="executeQuery">Execute Query (Ctrl+Enter)</button>
        <button @click="getSelectedText">Get Selection</button>
      </div>
    </header>
    <main class="main-content">
      <div class="editor-panel">
        <MonacoEditor 
          ref="editorRef"
          :language="currentLanguage"
        />
      </div>
      <div class="results-panel">
        <h3>Query Output:</h3>
        <pre class="sql-output">{{ queryOutput }}</pre>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import MonacoEditor from './components/MonacoEditor.vue';
import LanguageSelector from './components/LanguageSelector.vue';

// Available SQL languages
const languages = [
  { id: 'mysql', name: 'MySQL' },
  { id: 'flinksql', name: 'Flink SQL' },
  { id: 'sparksql', name: 'Spark SQL' },
  { id: 'hivesql', name: 'Hive SQL' },
  { id: 'pgsql', name: 'PostgreSQL' },
  { id: 'trinosql', name: 'Trino SQL' },
  { id: 'impalasql', name: 'Impala SQL' }
];

const defaultLanguage = 'mysql';

const editorRef = ref(null);
const currentLanguage = ref(defaultLanguage);
const queryOutput = ref('-- Your SQL query will appear here when you execute');

onMounted(() => {
  // Listen for keyboard shortcut events from the editor
  window.addEventListener('execute-sql', executeQuery);
});

onBeforeUnmount(() => {
  window.removeEventListener('execute-sql', executeQuery);
});

function handleLanguageChange(newLanguage) {
  currentLanguage.value = newLanguage;
}

function executeQuery() {
  if (!editorRef.value) return;
  
  const sql = editorRef.value.getValue();
  queryOutput.value = sql;
  
  // In your Laravel project, send this to your backend:
  // await $axios.post('/api/execute-sql', {
  //   query: sql,
  //   language: currentLanguage.value
  // }).then(response => {
  //   queryOutput.value = JSON.stringify(response.data, null, 2);
  // });
  
  console.log('Executing SQL:', sql);
}

function getSelectedText() {
  if (!editorRef.value) return;
  
  const selectedText = editorRef.value.getSelectedText();
  if (selectedText) {
    queryOutput.value = selectedText;
    console.log('Selected text:', selectedText);
  } else {
    alert('No text selected');
  }
}

// Global access for integration
window.getSqlQuery = () => editorRef.value?.getValue();
window.setSqlQuery = (query) => editorRef.value?.setValue(query);
window.getSelectedSql = () => editorRef.value?.getSelectedText();
</script>