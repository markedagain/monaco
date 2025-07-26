import { setupLanguages, setupLanguageWorkers } from 'monaco-sql-languages-ext';

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

// Setup enhanced language features
setupLanguages();