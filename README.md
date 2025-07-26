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
import { setupLanguages, setupLanguageWorkers, configureDbProviders } from 'monaco-sql-languages-ext';

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

// Configure your database schema (see Configuration section below)
configureDbProviders({
  catalogProvider: async (languageId) => ['my_catalog'],
  databaseProvider: async (languageId, catalog) => ['my_database'],
  tableProvider: async (languageId, catalog, database) => ['users', 'orders'],
  columnProvider: async (languageId, catalog, database, table) => {
    if (table === 'users') return ['id', 'name', 'email'];
    if (table === 'orders') return ['id', 'user_id', 'total'];
    return [];
  }
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

## Database Schema Configuration

The package provides flexible ways to configure your database schema for auto-completion. You can use provider functions, static data, or real API calls.

### Option 1: Provider Functions (Recommended)

```javascript
import { configureDbProviders } from 'monaco-sql-languages-ext';

// Mock provider that simulates API calls
class DatabaseProvider {
  async getCatalogs(languageId) {
    // Your logic to fetch catalogs
    return ['production', 'staging', 'development'];
  }

  async getDatabases(languageId, catalog) {
    // Your logic to fetch databases for a catalog
    return ['users_db', 'orders_db', 'analytics_db'];
  }

  async getTables(languageId, catalog, database) {
    // Your logic to fetch tables for a database
    return ['users', 'orders', 'payments'];
  }

  async getColumns(languageId, catalog, database, table) {
    // Your logic to fetch columns for a table
    if (table === 'users') {
      return [
        { name: 'id', type: 'BIGINT' },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'first_name', type: 'VARCHAR(100)' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ];
    }
    return [];
  }
}

const provider = new DatabaseProvider();
configureDbProviders({
  catalogProvider: provider.getCatalogs.bind(provider),
  databaseProvider: provider.getDatabases.bind(provider),
  tableProvider: provider.getTables.bind(provider),
  columnProvider: provider.getColumns.bind(provider)
});
```

### Option 2: Static Data

```javascript
import { configureDbProviders } from 'monaco-sql-languages-ext';

configureDbProviders({
  catalogs: ['my_catalog'],
  tmpDatabases: ['user_db', 'product_db'],
  tmpTables: ['users', 'products', 'orders'],
  tableColumns: {
    users: ['id', 'username', 'email', 'created_at'],
    products: ['id', 'name', 'price', 'category'],
    orders: ['id', 'user_id', 'product_id', 'quantity']
  }
});
```

### Option 3: Real API Integration

```javascript
import { configureDbProviders } from 'monaco-sql-languages-ext';

const API_BASE = 'https://your-api.com';
const API_KEY = 'your-api-key';

configureDbProviders({
  catalogProvider: async (languageId) => {
    const response = await fetch(`${API_BASE}/catalogs?lang=${languageId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.json();
  },

  databaseProvider: async (languageId, catalog) => {
    const url = catalog 
      ? `${API_BASE}/databases?catalog=${catalog}&lang=${languageId}`
      : `${API_BASE}/databases?lang=${languageId}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.json();
  },

  tableProvider: async (languageId, catalog, database) => {
    const params = new URLSearchParams({ lang: languageId });
    if (catalog) params.set('catalog', catalog);
    if (database) params.set('database', database);
    
    const response = await fetch(`${API_BASE}/tables?${params}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.json();
  },

  columnProvider: async (languageId, catalog, database, table) => {
    const params = new URLSearchParams({ lang: languageId, table });
    if (catalog) params.set('catalog', catalog);
    if (database) params.set('database', database);
    
    const response = await fetch(`${API_BASE}/columns?${params}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.json();
  }
});
```

### Enhanced Features

The package automatically enhances SQL completions with:

1. **Smart WHERE clause completions**: Shows relevant columns after WHERE
2. **Table.column completions**: Works with both aliases and full table names
3. **Context-aware suggestions**: Understands your SQL structure
4. **Configurable schema**: Use your own database metadata

## API

### Configuration Functions

- `configureDbProviders(config)` - Configure database metadata providers

#### Configuration Object

```typescript
interface DbConfig {
  // Provider functions (async)
  catalogProvider?: (languageId: string) => Promise<string[]>
  databaseProvider?: (languageId: string, catalog?: string) => Promise<string[]>
  tableProvider?: (languageId: string, catalog?: string, database?: string) => Promise<string[]>
  columnProvider?: (languageId: string, catalog?: string, database?: string, table: string) => Promise<Array<string | {name: string, type?: string}>>
  
  // Static data (synchronous)
  catalogs?: string[]
  databases?: string[]
  tmpDatabases?: string[]
  tables?: string[]
  tmpTables?: string[]
  tableColumns?: Record<string, string[]>
}
```

### Core Functions

- `setupLanguages(options?)` - Setup all SQL languages with enhanced features
- `setupLanguageWorkers(workers)` - Setup Monaco workers for SQL languages
- `completionService` - Enhanced completion service function

### Exports

All helper functions are also available for direct use:

```javascript
import {
  configureDbProviders,
  completionService,
  getCatalogs,
  getDataBases,
  getTables,
  getTableColumns,
  extractTableAliases,
  isAfterAliasDot
} from 'monaco-sql-languages-ext';
```

## Query Execution

This package provides SQL editing features (completion, syntax highlighting, validation) but does not include query execution. To execute SQL queries, you'll need to implement your own execution logic.

### Getting SQL Content from Editor

```javascript
// Get entire editor content
const sqlQuery = editor.getValue();

// Get selected text only
const selectedText = editor.getModel().getValueInRange(editor.getSelection());
```

### Adding Execute Functionality

#### Option 1: Execute Button

```javascript
const executeSql = async () => {
  const sqlQuery = editor.getValue();
  
  try {
    const response = await fetch('/api/execute-sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: sqlQuery, 
        database: selectedDatabase 
      })
    });
    
    const results = await response.json();
    
    // Display results in your UI
    console.log('Query results:', results);
    displayResults(results);
  } catch (error) {
    console.error('Query execution failed:', error);
  }
};

// Add to your component
<button @click="executeSql">Execute Query</button>
```

#### Option 2: Keyboard Shortcuts

```javascript
// Add Ctrl+Enter to execute
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
  executeSql();
});
```

#### Option 3: Context Menu

```javascript
// Add execute option to right-click menu
editor.addAction({
  id: 'execute-sql',
  label: 'Execute Query',
  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
  contextMenuGroupId: 'navigation',
  contextMenuOrder: 1,
  run: () => executeSql()
});
```

### Backend API Example

```javascript
// Express.js backend example
app.post('/api/execute-sql', async (req, res) => {
  const { query, database } = req.body;
  
  try {
    // Execute query against your database
    const results = await mysql.query(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### Integration with Popular SQL Clients

- **MySQL**: Use `mysql2` package for Node.js backends
- **PostgreSQL**: Use `pg` package
- **SQLite**: Use `better-sqlite3` package
- **Cloud Databases**: Use provider-specific SDKs (AWS RDS, Google Cloud SQL, etc.)

## Requirements

- Monaco Editor >= 0.31.0
- monaco-sql-languages >= 0.15.0

## License

MIT