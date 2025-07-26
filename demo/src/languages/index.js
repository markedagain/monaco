import { setupLanguages, setupLanguageWorkers, configureDbProviders } from 'monaco-sql-languages-ext';
import { MockDatabaseProvider, staticDatabaseConfig } from '../database/mockDbProvider';

// Import workers
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import FlinkSQLWorker from 'monaco-sql-languages/esm/languages/flink/flink.worker?worker';
import SparkSQLWorker from 'monaco-sql-languages/esm/languages/spark/spark.worker?worker';
import HiveSQLWorker from 'monaco-sql-languages/esm/languages/hive/hive.worker?worker';
import PGSQLWorker from 'monaco-sql-languages/esm/languages/pgsql/pgsql.worker?worker';
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';
import TrinoSQLWorker from 'monaco-sql-languages/esm/languages/trino/trino.worker?worker';
import ImpalaSQLWorker from 'monaco-sql-languages/esm/languages/impala/impala.worker?worker';

// Setup workers
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
// Option 1: Use mock provider with simulated API calls
const mockProvider = new MockDatabaseProvider();
configureDbProviders({
	catalogProvider: mockProvider.getCatalogs.bind(mockProvider),
	databaseProvider: mockProvider.getDatabases.bind(mockProvider),
	tableProvider: mockProvider.getTables.bind(mockProvider),
	columnProvider: mockProvider.getColumns.bind(mockProvider)
});

// Option 2: Use static data (uncomment to try)
// configureDbProviders(staticDatabaseConfig);

// Option 3: Use real API (example)
// const apiConfig = createApiDatabaseConfig('https://your-api.com', 'your-api-key');
// configureDbProviders(apiConfig);

// Setup enhanced language features
setupLanguages();