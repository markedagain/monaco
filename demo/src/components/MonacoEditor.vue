<template>
  <div id="editor-container" ref="editorContainer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import { setupLanguages, setupLanguageWorkers, configureDbProviders } from 'monaco-sql-languages-ext';
import { MockDatabaseProvider } from '../database/mockDbProvider';

// Import workers
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import FlinkSQLWorker from 'monaco-sql-languages/esm/languages/flink/flink.worker?worker';
import SparkSQLWorker from 'monaco-sql-languages/esm/languages/spark/spark.worker?worker';
import HiveSQLWorker from 'monaco-sql-languages/esm/languages/hive/hive.worker?worker';
import PGSQLWorker from 'monaco-sql-languages/esm/languages/pgsql/pgsql.worker?worker';
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';
import TrinoSQLWorker from 'monaco-sql-languages/esm/languages/trino/trino.worker?worker';
import ImpalaSQLWorker from 'monaco-sql-languages/esm/languages/impala/impala.worker?worker';

const props = defineProps({
  language: {
    type: String,
    required: true
  }
});

const editorContainer = ref(null);
let editor = null;
let isSetupComplete = false;

async function setupMonaco() {
  if (isSetupComplete) return;

  // Setup language workers
  setupLanguageWorkers({
    EditorWorker,
    FlinkSQLWorker,
    SparkSQLWorker,
    HiveSQLWorker,
    PGSQLWorker,
    MySQLWorker,
    TrinoSQLWorker,
    ImpalaSQLWorker
  });

  // Configure database providers
  const mockProvider = new MockDatabaseProvider();
  configureDbProviders({
    catalogProvider: mockProvider.getCatalogs.bind(mockProvider),
    databaseProvider: mockProvider.getDatabases.bind(mockProvider),
    tableProvider: mockProvider.getTables.bind(mockProvider),
    columnProvider: mockProvider.getColumns.bind(mockProvider)
  });

  // Setup enhanced language features
  setupLanguages();

  isSetupComplete = true;
}

onMounted(async () => {
  if (!editorContainer.value) return;

  // Setup Monaco SQL languages first
  await setupMonaco();

  editor = monaco.editor.create(editorContainer.value, {
    value: `-- Welcome to Monaco SQL Editor
-- Try typing: SELECT * FROM users WHERE 
-- Auto-completion should work!

SELECT 
    u.name,
    u.email,
    COUNT(o.id) as total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY total_orders DESC
LIMIT 10;`,
    language: props.language.toLowerCase(),
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    suggest: {
      snippetsPreventQuickSuggestions: false
    }
  });

  // Add Ctrl+Enter keyboard shortcut for execute
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('execute-sql'));
  });

  // Add context menu action
  editor.addAction({
    id: 'execute-sql',
    label: 'Execute Query',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1,
    run: () => {
      window.dispatchEvent(new CustomEvent('execute-sql'));
    }
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

function setValue(value) {
  if (editor) {
    editor.setValue(value);
  }
}

function getSelectedText() {
  if (editor) {
    const selection = editor.getSelection();
    return editor.getModel().getValueInRange(selection);
  }
  return '';
}

defineExpose({
  getValue,
  setValue,
  getSelectedText
});
</script>