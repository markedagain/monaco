import { languages } from 'monaco-editor/esm/vs/editor/editor.api';
import { EntityContextType, StmtContextType } from 'monaco-sql-languages/esm/main';

import { getCatalogs, getDataBases, getSchemas, getTables, getViews, getTableColumns, getColumns } from './dbMetaProvider';
import { 
	extractTableAliases, 
	extractDatabaseAliases, 
	createAliasCompletionItems, 
	isAfterAliasDot 
} from './aliasExtractor';

const haveCatalogSQLType = (languageId) => {
	return ['flinksql', 'trinosql'].includes(languageId.toLowerCase());
};

const namedSchemaSQLType = (languageId) => {
	return ['trinosql', 'hivesql', 'sparksql'].includes(languageId);
};

// Helper function to get pure entity text
const getPureEntityText = (text) => {
	// Remove quotes and backticks
	return text.replace(/[`'"]/g, '');
};

// Completion tracker class to avoid duplicates
class CompletionTracker {
	constructor() {
		this.completionTypes = new Set();
	}

	hasCompletionType(type) {
		return this.completionTypes.has(type);
	}

	markAsCompleted(type) {
		this.completionTypes.add(type);
	}
}

// Get columns from locally defined tables in entities
const getLocalTableColumns = (entities, tableNameAliasMap = {}) => {
	if (!entities || !entities.tableList) return [];
	
	const result = [];
	entities.tableList.forEach(tb => {
		const tableName = tableNameAliasMap[tb.text] || getPureEntityText(tb.text);
		if (tb.columns) {
			tb.columns.forEach(column => {
				const columnName = column.alias?.text || getPureEntityText(column.text);
				result.push({
					label: columnName + (column.colType?.text ? `(${column.colType.text})` : ''),
					insertText: columnName,
					kind: languages.CompletionItemKind.Field,
					detail: `\`${tableName}\`'s column`,
					sortText: '0' + tableName + columnName,
					_tableName: tableName,
					_columnText: columnName
				});
			});
		}
	});
	return result;
};

// Get columns from derived tables (subqueries)
const getDerivedTableColumns = (entities) => {
	if (!entities || !entities.derivedTableList) return [];
	
	const result = [];
	entities.derivedTableList.forEach(tb => {
		const tableName = tb.alias?.text || getPureEntityText(tb.text);
		const queryResult = tb.relatedEntities?.find(entity => 
			entity.entityContextType === EntityContextType.QUERY_RESULT
		);
		
		if (queryResult && queryResult.columns) {
			queryResult.columns.forEach(column => {
				const columnName = column.alias?.text || getPureEntityText(column.text);
				result.push({
					label: columnName,
					insertText: columnName,
					kind: languages.CompletionItemKind.Field,
					detail: `\`${tableName}\`'s column (derived)`,
					sortText: '0' + tableName + columnName,
					_tableName: tableName,
					_columnText: columnName
				});
			});
		}
	});
	return result;
};

// Get database object completions
const getDatabaseObjectCompletions = async (
	tracker,
	languageId,
	contextType,
	words
) => {
	const haveCatalog = haveCatalogSQLType(languageId);
	const getDBOrSchema = namedSchemaSQLType(languageId) ? getSchemas : getDataBases;
	const wordCount = words.length;
	const result = [];

	// Complete Catalog
	if (wordCount <= 1 && haveCatalog && !tracker.hasCompletionType('catalog')) {
		if ([EntityContextType.CATALOG, EntityContextType.DATABASE_CREATE].includes(contextType)) {
			result.push(...(await getCatalogs(languageId)));
			tracker.markAsCompleted('catalog');
		}
	}

	// Complete Database
	if (wordCount <= 1 && !tracker.hasCompletionType('database')) {
		if ([
			EntityContextType.DATABASE,
			EntityContextType.TABLE,
			EntityContextType.TABLE_CREATE,
			EntityContextType.VIEW,
			EntityContextType.VIEW_CREATE
		].includes(contextType)) {
			result.push(...(await getDBOrSchema(languageId)));
			tracker.markAsCompleted('database');
		}
	}

	// Complete Database under Catalog
	if (wordCount >= 2 && wordCount <= 3 && haveCatalog && !tracker.hasCompletionType('database_in_catalog')) {
		if ([
			EntityContextType.DATABASE,
			EntityContextType.TABLE,
			EntityContextType.TABLE_CREATE,
			EntityContextType.VIEW,
			EntityContextType.VIEW_CREATE
		].includes(contextType)) {
			result.push(...(await getDBOrSchema(languageId, words[0])));
			tracker.markAsCompleted('database_in_catalog');
		}
	}

	// Complete Table
	if (contextType === EntityContextType.TABLE && wordCount <= 1 && !tracker.hasCompletionType('table')) {
		result.push(...(await getTables(languageId)));
		tracker.markAsCompleted('table');
	}

	// Complete Tables under Database
	if (contextType === EntityContextType.TABLE && wordCount >= 2 && wordCount <= 3 && !tracker.hasCompletionType('table_in_database')) {
		result.push(...(await getTables(languageId, undefined, words[0])));
		tracker.markAsCompleted('table_in_database');
	}

	// Complete Tables under Catalog.Database
	if (contextType === EntityContextType.TABLE && wordCount >= 4 && wordCount <= 5 && haveCatalog && !tracker.hasCompletionType('table_in_catalog_database')) {
		result.push(...(await getTables(languageId, words[0], words[2])));
		tracker.markAsCompleted('table_in_catalog_database');
	}

	// Complete View
	if (contextType === EntityContextType.VIEW && wordCount <= 1 && !tracker.hasCompletionType('view')) {
		result.push(...(await getViews(languageId)));
		tracker.markAsCompleted('view');
	}

	// Complete Views under Database
	if (contextType === EntityContextType.VIEW && wordCount >= 2 && wordCount <= 3 && !tracker.hasCompletionType('view_in_database')) {
		result.push(...(await getViews(languageId, undefined, words[0])));
		tracker.markAsCompleted('view_in_database');
	}

	// Complete Views under Catalog.Database
	if (contextType === EntityContextType.VIEW && wordCount >= 4 && wordCount <= 5 && !tracker.hasCompletionType('view_in_catalog_database')) {
		result.push(...(await getViews(languageId, words[0], words[2])));
		tracker.markAsCompleted('view_in_catalog_database');
	}

	// Complete Columns (for WHERE, SELECT, etc.)
	if (contextType === EntityContextType.COLUMN && !tracker.hasCompletionType('column')) {
		// For column context, we want to show tables and their columns
		if (wordCount <= 1) {
			// Show tables that can be used for column reference
			result.push(...(await getTables(languageId)));
			tracker.markAsCompleted('column');
		}
	}

	return result;
};

export const completionService = async function (
	model,
	position,
	_completionContext,
	suggestions,
	entities,
	snippets
) {
	if (!suggestions) {
		return Promise.resolve([]);
	}
	
	const languageId = model.getLanguageId();
	const haveCatalog = haveCatalogSQLType(languageId);
	const getDBOrSchema = namedSchemaSQLType(languageId) ? getSchemas : getDataBases;

	// Get the current SQL text
	const sqlText = model.getValue();
	const currentPosition = model.getOffsetAt(position);

	// Extract aliases from the current SQL
	const tableAliases = extractTableAliases(sqlText);
	const databaseAliases = extractDatabaseAliases(sqlText);
	const allAliases = [...tableAliases, ...databaseAliases];
	
	// Extract table names from FROM clause for column completions
	const fromMatch = sqlText.match(/FROM\s+([^\s,]+)(?:\s+(?:AS\s+)?(\w+))?/i);
	const tableNameFromFrom = fromMatch ? fromMatch[1] : null;

	// Check if we're completing after an alias dot notation
	const aliasContext = isAfterAliasDot(sqlText, currentPosition);

	const { keywords, syntax } = suggestions;
	const tracker = new CompletionTracker();

	// Keywords completion items
	const keywordsCompletionItems = keywords.map((kw) => ({
		label: kw,
		kind: languages.CompletionItemKind.Keyword,
		detail: '关键字',
		sortText: '2' + kw
	}));

	let syntaxCompletionItems = [];

	// Process syntax suggestions
	let isColumnContext = false;
	for (let i = 0; i < syntax.length; i++) {
		const { syntaxContextType, wordRanges } = syntax[i];
		const words = wordRanges.map((wr) => wr.text);
		
		// Check if we're in a column context (WHERE, SELECT, etc.)
		if (syntaxContextType === EntityContextType.COLUMN) {
			isColumnContext = true;
		}
		
		// Get database object completions
		const dbObjectCompletions = await getDatabaseObjectCompletions(
			tracker,
			languageId,
			syntaxContextType,
			words
		);
		syntaxCompletionItems = syntaxCompletionItems.concat(dbObjectCompletions);
	}

	// Get local column completions from entities
	let columnCompletionItems = [];
	if (entities) {
		// Build table name alias map
		const tableNameAliasMap = {};
		if (entities.tableList) {
			entities.tableList.forEach(tb => {
				if (tb.alias?.text) {
					tableNameAliasMap[tb.text] = tb.alias.text;
				}
			});
		}
		
		// Get columns from source tables
		columnCompletionItems = columnCompletionItems.concat(
			getLocalTableColumns(entities, tableNameAliasMap)
		);
		
		// Get columns from derived tables
		columnCompletionItems = columnCompletionItems.concat(
			getDerivedTableColumns(entities)
		);
	}

	// Create snippet completion items
	const snippetCompletionItems = snippets?.map((item) => ({
		label: item.label || item.prefix,
		kind: languages.CompletionItemKind.Snippet,
		filterText: item.prefix,
		insertText: item.insertText,
		insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
		sortText: '3' + item.prefix,
		detail: item.description !== undefined ? item.description : 'SQL模板',
		documentation: item.insertText
	})) || [];

	// Create alias completion items
	let aliasCompletionItems = [];
	
	// If we're after an alias dot notation, provide table-specific completions
	if (aliasContext) {
		// First check if we have local columns for this alias
		const localColumns = columnCompletionItems.filter(col => 
			col._tableName === aliasContext.tableName || 
			col._tableName === aliasContext.alias
		);
		
		if (localColumns.length > 0) {
			aliasCompletionItems = localColumns.map(col => ({
				...col,
				detail: `Column from ${aliasContext.tableName} (alias: ${aliasContext.alias})`,
				documentation: `Column from table ${aliasContext.tableName} accessed via alias ${aliasContext.alias}`
			}));
		} else {
			// Fall back to metadata columns
			const tableColumns = await getTableColumns(languageId, aliasContext.tableName);
			aliasCompletionItems = tableColumns.map(col => ({
				...col,
				detail: `Column from ${aliasContext.tableName} (alias: ${aliasContext.alias})`,
				documentation: `Column from table ${aliasContext.tableName} accessed via alias ${aliasContext.alias}`
			}));
		}
	} else {
		// Provide alias completions for general context
		aliasCompletionItems = createAliasCompletionItems(allAliases);
		
		// Also include column completions when not in alias context
		aliasCompletionItems = aliasCompletionItems.concat(columnCompletionItems);
	}

	// If we're in a column context (like after WHERE), we want to show both tables and columns
	if (isColumnContext) {
		// Get column completions from all available tables in the context
		let allColumnCompletions = [...columnCompletionItems];
		
		// If we have a table from FROM clause and no local columns, get its columns
		if (tableNameFromFrom && allColumnCompletions.length === 0) {
			const cleanTableName = getPureEntityText(tableNameFromFrom);
			const columns = await getTableColumns(languageId, cleanTableName);
			allColumnCompletions = columns.map(col => ({
				...col,
				detail: `Column from ${cleanTableName}`,
				sortText: '0' + col.label
			}));
		}
		
		// Also try to get columns from syntax suggestions if still no columns
		if (allColumnCompletions.length === 0) {
			// Look for tables in the current context from syntax suggestions
			const tablesInContext = [];
			
			// Check if we have table references in the SQL
			for (const syntaxItem of syntaxCompletionItems) {
				if (syntaxItem.detail === 'table' || syntaxItem.kind === languages.CompletionItemKind.Field) {
					tablesInContext.push(syntaxItem.label);
				}
			}
			
			// Get columns for each table found
			if (tablesInContext.length > 0) {
				const tableColumnPromises = tablesInContext.map(async (tableName) => {
					const columns = await getTableColumns(languageId, tableName);
					return columns.map(col => ({
						...col,
						detail: `Column from ${tableName}`,
						sortText: '0' + col.label
					}));
				});
				
				const tableColumns = await Promise.all(tableColumnPromises);
				allColumnCompletions = tableColumns.flat();
			}
		}
		
		// Include both columns and tables when in column context
		return [...allColumnCompletions, ...aliasCompletionItems, ...syntaxCompletionItems, ...keywordsCompletionItems, ...snippetCompletionItems];
	}

	return [...aliasCompletionItems, ...syntaxCompletionItems, ...keywordsCompletionItems, ...snippetCompletionItems];
};