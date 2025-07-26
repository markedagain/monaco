import { languages } from 'monaco-editor/esm/vs/editor/editor.api';

// Default mock data - users can override these
const defaultCatalogList = ['mock_catalog_1', 'mock_catalog_2', 'mock_catalog_3'];
const defaultSchemaList = ['mock_schema_1', 'mock_schema_2', 'mock_schema_3'];
const defaultDatabaseList = ['mock_database_1', 'mock_database_2', 'mock_database_3'];
const defaultTableList = ['mock_table1', 'mock_table2', 'mock_table3'];
const defaultViewList = ['mock_view1', 'mock_view2', 'mock_view3'];

const defaultTmpDatabaseList = ['current_catalog_db1', 'current_catalog_db2', 'current_catalog_db3'];
const defaultTmpSchemaList = [
	'current_catalog_schema1',
	'current_catalog_schema2',
	'current_catalog_schema3'
];
const defaultTmpTableList = ['current_db_table1', 'current_db_table2', 'current_db_table3'];
const defaultTmpViewList = ['current_db_view1', 'current_db_view2', 'current_db_view3'];

// Default mock column data for tables
const defaultTableColumns = {
	'mock_table1': ['id', 'name', 'email', 'created_at', 'updated_at'],
	'mock_table2': ['user_id', 'product_id', 'quantity', 'price', 'order_date'],
	'mock_table3': ['category_id', 'category_name', 'description', 'status'],
	'current_db_table1': ['employee_id', 'first_name', 'last_name', 'department', 'salary'],
	'current_db_table2': ['project_id', 'project_name', 'start_date', 'end_date', 'budget'],
	'current_db_table3': ['customer_id', 'company_name', 'contact_person', 'phone', 'address']
};

// Configuration object that users can override
let dbConfig = {
	// Data providers - users can set these to their own functions
	catalogProvider: null,
	databaseProvider: null,
	schemaProvider: null,
	tableProvider: null,
	viewProvider: null,
	columnProvider: null,
	
	// Static data - users can set these directly
	catalogs: defaultCatalogList,
	databases: defaultDatabaseList,
	schemas: defaultSchemaList,
	tables: defaultTableList,
	views: defaultViewList,
	tmpDatabases: defaultTmpDatabaseList,
	tmpSchemas: defaultTmpSchemaList,
	tmpTables: defaultTmpTableList,
	tmpViews: defaultTmpViewList,
	tableColumns: defaultTableColumns
};

/**
 * Configure database metadata providers
 * @param {Object} config - Configuration object
 * @param {Function} config.catalogProvider - Async function to get catalogs: (languageId) => Promise<string[]>
 * @param {Function} config.databaseProvider - Async function to get databases: (languageId, catalog?) => Promise<string[]>
 * @param {Function} config.schemaProvider - Async function to get schemas: (languageId, catalog?) => Promise<string[]>
 * @param {Function} config.tableProvider - Async function to get tables: (languageId, catalog?, database?) => Promise<string[]>
 * @param {Function} config.viewProvider - Async function to get views: (languageId, catalog?, database?) => Promise<string[]>
 * @param {Function} config.columnProvider - Async function to get columns: (languageId, catalog?, database?, table) => Promise<{name: string, type?: string}[]>
 * @param {Object} config.staticData - Static data to use instead of providers
 */
export function configureDbProviders(config) {
	dbConfig = { ...dbConfig, ...config };
}

const prefixLabel = (languageId, text) => {
	const prefix = languageId ? languageId.replace(/sql/gi, '').toLocaleLowerCase() : '';
	return prefix ? `${prefix}_${text}` : text;
};

/**
 * Get all catalogs
 */
export async function getCatalogs(languageId) {
	// Use custom provider if available
	if (dbConfig.catalogProvider) {
		const catalogs = await dbConfig.catalogProvider(languageId);
		return catalogs.map((cat) => ({
			label: prefixLabel(languageId, cat),
			kind: languages.CompletionItemKind.Field,
			detail: 'catalog',
			sortText: '1' + prefixLabel(languageId, cat)
		}));
	}
	
	// Use static data
	const catCompletions = dbConfig.catalogs.map((cat) => ({
		label: prefixLabel(languageId, cat),
		kind: languages.CompletionItemKind.Field,
		detail: 'catalog',
		sortText: '1' + prefixLabel(languageId, cat)
	}));
	return catCompletions;
}

/**
 * Get databases by catalog
 */
export async function getDataBases(languageId, catalog) {
	// Use custom provider if available
	if (dbConfig.databaseProvider) {
		const databases = await dbConfig.databaseProvider(languageId, catalog);
		return databases.map((db) => ({
			label: prefixLabel(languageId, db),
			kind: languages.CompletionItemKind.Field,
			detail: 'database',
			sortText: '1' + prefixLabel(languageId, db)
		}));
	}
	
	// Use static data
	const databases = catalog ? dbConfig.databases : dbConfig.tmpDatabases;
	const databaseCompletions = databases.map((db) => ({
		label: prefixLabel(languageId, db),
		kind: languages.CompletionItemKind.Field,
		detail: 'database',
		sortText: '1' + prefixLabel(languageId, db)
	}));
	return databaseCompletions;
}

/**
 * Get schemas by catalog
 */
export async function getSchemas(languageId, catalog) {
	// Use custom provider if available
	if (dbConfig.schemaProvider) {
		const schemas = await dbConfig.schemaProvider(languageId, catalog);
		return schemas.map((sc) => ({
			label: prefixLabel(languageId, sc),
			kind: languages.CompletionItemKind.Field,
			detail: 'schema',
			sortText: '1' + prefixLabel(languageId, sc)
		}));
	}
	
	// Use static data
	const schemas = catalog ? dbConfig.schemas : dbConfig.tmpSchemas;
	const schemaCompletions = schemas.map((sc) => ({
		label: prefixLabel(languageId, sc),
		kind: languages.CompletionItemKind.Field,
		detail: 'schema',
		sortText: '1' + prefixLabel(languageId, sc)
	}));
	return schemaCompletions;
}

/**
 * Get tables by catalog and database
 */
export async function getTables(languageId, catalog, database) {
	// Use custom provider if available
	if (dbConfig.tableProvider) {
		const tables = await dbConfig.tableProvider(languageId, catalog, database);
		return tables.map((tb) => ({
			label: prefixLabel(languageId, tb),
			kind: languages.CompletionItemKind.Field,
			detail: 'table',
			sortText: '1' + prefixLabel(languageId, tb)
		}));
	}
	
	// Use static data
	const tables = catalog && database ? dbConfig.tables : dbConfig.tmpTables;
	const tableCompletions = tables.map((tb) => ({
		label: prefixLabel(languageId, tb),
		kind: languages.CompletionItemKind.Field,
		detail: 'table',
		sortText: '1' + prefixLabel(languageId, tb)
	}));
	return tableCompletions;
}

/**
 * Get views by catalog and database
 */
export async function getViews(languageId, catalog, database) {
	// Use custom provider if available
	if (dbConfig.viewProvider) {
		const views = await dbConfig.viewProvider(languageId, catalog, database);
		return views.map((v) => ({
			label: prefixLabel(languageId, v),
			kind: languages.CompletionItemKind.Field,
			detail: 'view',
			sortText: '1' + prefixLabel(languageId, v)
		}));
	}
	
	// Use static data
	const views = catalog && database ? dbConfig.views : dbConfig.tmpViews;
	const viewCompletions = views.map((v) => ({
		label: prefixLabel(languageId, v),
		kind: languages.CompletionItemKind.Field,
		detail: 'view',
		sortText: '1' + prefixLabel(languageId, v)
	}));
	return viewCompletions;
}

/**
 * Get columns for a specific table
 */
export async function getTableColumns(languageId, tableName) {
	// Use custom provider if available
	if (dbConfig.columnProvider) {
		const columns = await dbConfig.columnProvider(languageId, null, null, tableName);
		return columns.map((col) => ({
			label: typeof col === 'string' ? col : col.name,
			kind: languages.CompletionItemKind.Field,
			detail: `Column from ${tableName}${typeof col === 'object' && col.type ? ` (${col.type})` : ''}`,
			sortText: '0' + (typeof col === 'string' ? col : col.name)
		}));
	}
	
	// Use static data
	const cleanTableName = tableName.replace(new RegExp(`^${languageId.replace(/sql/gi, '').toLowerCase()}_`), '');
	const columns = dbConfig.tableColumns[cleanTableName] || ['id', 'name', 'value'];
	
	const columnCompletions = columns.map((col) => ({
		label: col,
		kind: languages.CompletionItemKind.Field,
		detail: `Column from ${tableName}`,
		sortText: '0' + col
	}));
	return columnCompletions;
}

/**
 * Get columns for table with catalog and database context
 */
export async function getColumns(languageId, catalog, database, tableName) {
	// Use custom provider if available
	if (dbConfig.columnProvider) {
		const columns = await dbConfig.columnProvider(languageId, catalog, database, tableName);
		return columns.map((col) => ({
			label: typeof col === 'string' ? col : col.name,
			insertText: typeof col === 'string' ? col : col.name,
			kind: languages.CompletionItemKind.Field,
			detail: `${catalog ? catalog + '.' : ''}${database ? database + '.' : ''}${tableName}.${typeof col === 'string' ? col : col.name}${typeof col === 'object' && col.type ? ` (${col.type})` : ''}`,
			sortText: '0' + (typeof col === 'string' ? col : col.name)
		}));
	}
	
	// Use static data
	const cleanTableName = tableName.replace(new RegExp(`^${languageId.replace(/sql/gi, '').toLowerCase()}_`), '');
	const columns = dbConfig.tableColumns[cleanTableName] || ['id', 'name', 'value'];
	
	const columnCompletions = columns.map((col) => ({
		label: col,
		insertText: col,
		kind: languages.CompletionItemKind.Field,
		detail: `${catalog ? catalog + '.' : ''}${database ? database + '.' : ''}${tableName}.${col}`,
		sortText: '0' + col
	}));
	return columnCompletions;
}