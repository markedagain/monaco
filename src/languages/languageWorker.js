// @ts-nocheck
import { LanguageIdEnum } from 'monaco-sql-languages/esm/main.js';

/**
 * Setup Monaco environment with SQL language workers
 * This should be called in your application before using the editor
 * 
 * @param {Object} workers - Worker constructors
 * @param {Function} workers.EditorWorker - Base editor worker
 * @param {Function} workers.FlinkSQLWorker - Flink SQL worker
 * @param {Function} workers.SparkSQLWorker - Spark SQL worker
 * @param {Function} workers.HiveSQLWorker - Hive SQL worker
 * @param {Function} workers.PGSQLWorker - PostgreSQL worker
 * @param {Function} workers.MySQLWorker - MySQL worker
 * @param {Function} workers.TrinoSQLWorker - Trino SQL worker
 * @param {Function} workers.ImpalaSQLWorker - Impala SQL worker
 */
export function setupLanguageWorkers(workers) {
	globalThis.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === LanguageIdEnum.FLINK && workers.FlinkSQLWorker) {
				return new workers.FlinkSQLWorker();
			}
			if (label === LanguageIdEnum.HIVE && workers.HiveSQLWorker) {
				return new workers.HiveSQLWorker();
			}
			if (label === LanguageIdEnum.SPARK && workers.SparkSQLWorker) {
				return new workers.SparkSQLWorker();
			}
			if (label === LanguageIdEnum.PG && workers.PGSQLWorker) {
				return new workers.PGSQLWorker();
			}
			if (label === LanguageIdEnum.MYSQL && workers.MySQLWorker) {
				return new workers.MySQLWorker();
			}
			if (label === LanguageIdEnum.TRINO && workers.TrinoSQLWorker) {
				return new workers.TrinoSQLWorker();
			}
			if (label === LanguageIdEnum.IMPALA && workers.ImpalaSQLWorker) {
				return new workers.ImpalaSQLWorker();
			}
			return new workers.EditorWorker();
		}
	};
}