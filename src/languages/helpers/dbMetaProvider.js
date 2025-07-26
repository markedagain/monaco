import { languages } from 'monaco-editor/esm/vs/editor/editor.api';

const catalogList = ['mock_catalog_1', 'mock_catalog_2', 'mock_catalog_3'];
const schemaList = ['mock_schema_1', 'mock_schema_2', 'mock_schema_3'];
const databaseList = ['mock_database_1', 'mock_database_2', 'mock_database_3'];
const tableList = ['mock_table1', 'mock_table2', 'mock_table3'];
const viewList = ['mock_view1', 'mock_view2', 'mock_view3'];

const tmpDatabaseList = ['current_catalog_db1', 'current_catalog_db2', 'current_catalog_db3'];
const tmpSchemaList = [
	'current_catalog_schema1',
	'current_catalog_schema2',
	'current_catalog_schema3'
];
const tmpTableList = ['current_db_table1', 'current_db_table2', 'current_db_table3'];
const tmpViewList = ['current_db_view1', 'current_db_view2', 'current_db_view3'];

// Mock column data for tables
const tableColumns = {
	'mock_table1': ['id', 'name', 'email', 'created_at', 'updated_at'],
	'mock_table2': ['user_id', 'product_id', 'quantity', 'price', 'order_date'],
	'mock_table3': ['category_id', 'category_name', 'description', 'status'],
	'current_db_table1': ['employee_id', 'first_name', 'last_name', 'department', 'salary'],
	'current_db_table2': ['project_id', 'project_name', 'start_date', 'end_date', 'budget'],
	'current_db_table3': ['customer_id', 'company_name', 'contact_person', 'phone', 'address']
};

const prefixLabel = (languageId, text) => {
	const prefix = languageId ? languageId.replace(/sql/gi, '').toLocaleLowerCase() : '';
	return prefix ? `${prefix}_${text}` : text;
};

/**
 * 获取所有的 catalog
 */
export function getCatalogs(languageId) {
	const catCompletions = catalogList.map((cat) => ({
		label: prefixLabel(languageId, cat),
		kind: languages.CompletionItemKind.Field,
		detail: 'catalog',
		sortText: '1' + prefixLabel(languageId, cat)
	}));
	return Promise.resolve(catCompletions);
}

/**
 * 根据catalog 获取 database
 */
export function getDataBases(languageId, catalog) {
	const databases = catalog ? databaseList : tmpDatabaseList;

	const databaseCompletions = databases.map((db) => ({
		label: prefixLabel(languageId, db),
		kind: languages.CompletionItemKind.Field,
		detail: 'database',
		sortText: '1' + prefixLabel(languageId, db)
	}));

	return Promise.resolve(databaseCompletions);
}

/**
 * 根据catalog 获取 schema
 */
export function getSchemas(languageId, catalog) {
	const schemas = catalog ? schemaList : tmpSchemaList;

	const schemaCompletions = schemas.map((sc) => ({
		label: prefixLabel(languageId, sc),
		kind: languages.CompletionItemKind.Field,
		detail: 'schema',
		sortText: '1' + prefixLabel(languageId, sc)
	}));

	return Promise.resolve(schemaCompletions);
}

/**
 * 根据 catalog 和 database 获取 table
 */
export function getTables(languageId, catalog, database) {
	const tables = catalog && database ? tableList : tmpTableList;

	const tableCompletions = tables.map((tb) => ({
		label: prefixLabel(languageId, tb),
		kind: languages.CompletionItemKind.Field,
		detail: 'table',
		sortText: '1' + prefixLabel(languageId, tb)
	}));

	return Promise.resolve(tableCompletions);
}

/**
 * 根据 catalog 和 database 获取 view
 */
export function getViews(languageId, catalog, database) {
	const views = catalog && database ? viewList : tmpViewList;

	const viewCompletions = views.map((v) => ({
		label: prefixLabel(languageId, v),
		kind: languages.CompletionItemKind.Field,
		detail: 'view',
		sortText: '1' + prefixLabel(languageId, v)
	}));

	return Promise.resolve(viewCompletions);
}

/**
 * Get columns for a specific table
 */
export function getTableColumns(languageId, tableName) {
	// Remove language prefix if present
	const cleanTableName = tableName.replace(new RegExp(`^${languageId.replace(/sql/gi, '').toLowerCase()}_`), '');
	const columns = tableColumns[cleanTableName] || ['id', 'name', 'value']; // Default columns
	
	const columnCompletions = columns.map((col) => ({
		label: col,
		kind: languages.CompletionItemKind.Field,
		detail: `Column from ${tableName}`,
		sortText: '0' + col
	}));

	return Promise.resolve(columnCompletions);
}