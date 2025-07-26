<template>
  <div class="container">
    <header class="header">
      <div class="controls">
        <LanguageSelector 
          :languages="languages"
          :currentLanguage="currentLanguage"
          @language-changed="handleLanguageChange"
        />
        <button id="parse-button" @click="parseSQL">Parse SQL</button>
      </div>
    </header>
    <main class="main-content">
      <div class="editor-panel">
        <MonacoEditor 
          ref="editorRef"
          :language="currentLanguage"
          @content-changed="handleContentChange"
        />
      </div>
      <OutputPanel 
        :problems="problems"
        :parseOutput="parseOutput"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { LanguageService } from 'monaco-sql-languages/esm/languageService';
import MonacoEditor from './components/MonacoEditor.vue';
import LanguageSelector from './components/LanguageSelector.vue';
import OutputPanel from './components/OutputPanel.vue';
import { languages, defaultLanguage } from './config';

const editorRef = ref(null);
const currentLanguage = ref(defaultLanguage);
const problems = ref('');
const parseOutput = ref('');
const languageService = ref(null);

onMounted(() => {
  languageService.value = new LanguageService();
});

function handleLanguageChange(newLanguage) {
  currentLanguage.value = newLanguage;
  validateSQL();
}

function handleContentChange() {
  validateSQL();
}

async function parseSQL() {
  if (!editorRef.value || !languageService.value) return;
  
  const sql = editorRef.value.getValue();
  
  try {
    const result = await languageService.value.parserTreeToString(
      currentLanguage.value.toLowerCase(), 
      sql
    );
    parseOutput.value = result || 'Parse successful (no AST available)';
  } catch (error) {
    parseOutput.value = `Parse error: ${error}`;
  }
}

async function validateSQL() {
  if (!editorRef.value || !languageService.value) return;
  
  const sql = editorRef.value.getValue();
  
  try {
    const errors = await languageService.value.valid(
      currentLanguage.value.toLowerCase(), 
      sql
    );
    
    if (errors && errors.length > 0) {
      const errorList = errors.map((error) => 
        `Line ${error.startLine}:${error.startCol} - ${error.message}`
      ).join('\n');
      problems.value = errorList;
    } else {
      problems.value = 'No syntax errors';
    }
  } catch (error) {
    problems.value = `Validation error: ${error}`;
  }
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedValidate = debounce(validateSQL, 200);
</script>