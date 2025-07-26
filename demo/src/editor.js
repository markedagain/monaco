import * as monaco from 'monaco-editor';
import { LanguageService } from 'monaco-sql-languages/esm/languageService';
import { languages, defaultLanguage } from './config';

let editor;
let languageService;
let currentLanguage = defaultLanguage;

export function initializeEditor() {
  const container = document.getElementById('editor-container');
  if (!container) return;

  languageService = new LanguageService();

  // Create editor
  editor = monaco.editor.create(container, {
    value: '',
    language: currentLanguage.toLowerCase(),
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    suggest: {
      snippetsPreventQuickSuggestions: false
    }
  });

  // Set up language selector
  setupLanguageSelector();

  // Set up parse button
  setupParseButton();

  // Set up validation
  editor.onDidChangeModelContent(debounce(() => validateSQL(), 200));
}

function setupLanguageSelector() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;

  // Populate options
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    selector.appendChild(option);
  });

  selector.value = currentLanguage;

  selector.addEventListener('change', (e) => {
    const target = e.target;
    currentLanguage = target.value;
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, currentLanguage.toLowerCase());
    }
    validateSQL();
  });
}

function setupParseButton() {
  const button = document.getElementById('parse-button');
  if (!button) return;

  button.addEventListener('click', async () => {
    const sql = editor.getValue();
    const output = document.getElementById('output');
    if (!output) return;

    try {
      const result = await languageService.parserTreeToString(currentLanguage.toLowerCase(), sql);
      output.textContent = result || 'Parse successful (no AST available)';
    } catch (error) {
      output.textContent = `Parse error: ${error}`;
    }
  });
}

async function validateSQL() {
  const sql = editor.getValue();
  const problems = document.getElementById('problems');
  if (!problems) return;

  try {
    const errors = await languageService.valid(currentLanguage.toLowerCase(), sql);
    
    if (errors && errors.length > 0) {
      const errorList = errors.map((error) => 
        `Line ${error.startLine}:${error.startCol} - ${error.message}`
      ).join('\n');
      problems.textContent = errorList;
      problems.className = 'problems error';
    } else {
      problems.textContent = 'No syntax errors';
      problems.className = 'problems success';
    }
  } catch (error) {
    problems.textContent = `Validation error: ${error}`;
    problems.className = 'problems error';
  }
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}