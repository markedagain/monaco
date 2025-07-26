# monaco-sql-languages-ext

Enhanced SQL language support for Monaco Editor with improved auto-completion features.

## Features

- 🚀 Enhanced WHERE clause completions
- 🎯 Smart column completions from table context
- 🔧 Support for table aliases and full table names
- 💡 Improved metadata-driven completions
- 🌐 Support for multiple SQL dialects (MySQL, PostgreSQL, Flink, Spark, Hive, Trino, Impala)

## Installation

```bash
npm install monaco-sql-languages-ext
```

## Usage

### Basic Setup

```javascript
import * as monaco from 'monaco-editor';
import { setupLanguages, setupLanguageWorkers } from 'monaco-sql-languages-ext';

// Import workers (adjust paths based on your bundler)
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import FlinkSQLWorker from 'monaco-sql-languages/esm/languages/flink/flink.worker?worker';
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';
// ... other workers

// Setup language workers
setupLanguageWorkers({
  EditorWorker,
  FlinkSQLWorker,
  MySQLWorker,
  // ... other workers
});

// Setup enhanced language features
setupLanguages();

// Create editor
const editor = monaco.editor.create(document.getElementById('editor'), {
  value: 'SELECT * FROM users WHERE ',
  language: 'mysql',
  theme: 'vs-dark'
});
```

### Custom Completion Service

```javascript
import { setupLanguages, completionService } from 'monaco-sql-languages-ext';

// Use custom completion service
setupLanguages({
  completionService: myCustomCompletionService
});
```

### Enhanced Features

The package automatically enhances SQL completions with:

1. **Smart WHERE clause completions**: Shows relevant columns after WHERE
2. **Table.column completions**: Works with both aliases and full table names
3. **Context-aware suggestions**: Understands your SQL structure

## API

### Functions

- `setupLanguages(options?)` - Setup all SQL languages with enhanced features
- `setupLanguageWorkers(workers)` - Setup Monaco workers for SQL languages
- `completionService` - Enhanced completion service function

### Exports

All helper functions are also available for direct use:

```javascript
import {
  completionService,
  getCatalogs,
  getDataBases,
  getTables,
  getTableColumns,
  extractTableAliases,
  isAfterAliasDot
} from 'monaco-sql-languages-ext';
```

## Requirements

- Monaco Editor >= 0.31.0
- monaco-sql-languages >= 0.15.0

## License

MIT