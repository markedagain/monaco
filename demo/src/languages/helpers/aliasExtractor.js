import { languages } from 'monaco-editor/esm/vs/editor/editor.api';

/**
 * Extract table aliases from SQL text
 * Handles patterns like:
 * - FROM table_name alias
 * - FROM table_name AS alias
 * - JOIN table_name alias
 * - JOIN table_name AS alias
 */
export function extractTableAliases(sqlText) {
    if (!sqlText) return [];
    
    const aliases = [];
    
    // Regular expressions to match different alias patterns
    const patterns = [
        // FROM/JOIN table_name AS alias
        /(?:FROM|JOIN)\s+([^\s]+)\s+AS\s+([^\s,;]+)/gi,
        // FROM/JOIN table_name alias (without AS)
        /(?:FROM|JOIN)\s+([^\s]+)\s+([^\s,;WHERE\)]+)(?=\s|,|;|WHERE|\)|$)/gi,
        // FROM/JOIN database.table AS alias
        /(?:FROM|JOIN)\s+([^\s]+\.[^\s]+)\s+AS\s+([^\s,;]+)/gi,
        // FROM/JOIN database.table alias (without AS)
        /(?:FROM|JOIN)\s+([^\s]+\.[^\s]+)\s+([^\s,;WHERE\)]+)(?=\s|,|;|WHERE|\)|$)/gi
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(sqlText)) !== null) {
            const tableName = match[1];
            const alias = match[2];
            
            // Skip if alias is a SQL keyword
            if (!isReservedKeyword(alias) && alias.length > 0) {
                aliases.push({
                    alias: alias,
                    tableName: tableName,
                    type: 'table'
                });
            }
        }
    });
    
    // Remove duplicates
    const uniqueAliases = aliases.filter((alias, index, self) => 
        index === self.findIndex(a => a.alias === alias.alias)
    );
    
    return uniqueAliases;
}

/**
 * Extract database aliases from SQL text
 * Handles patterns like:
 * - USE database_name AS alias
 * - database_name.table AS db_alias
 */
export function extractDatabaseAliases(sqlText) {
    if (!sqlText) return [];
    
    const aliases = [];
    
    // Pattern for explicit database aliases (less common but possible)
    const dbAliasPattern = /USE\s+([^\s]+)\s+AS\s+([^\s,;]+)/gi;
    
    let match;
    while ((match = dbAliasPattern.exec(sqlText)) !== null) {
        const databaseName = match[1];
        const alias = match[2];
        
        if (!isReservedKeyword(alias) && alias.length > 0) {
            aliases.push({
                alias: alias,
                databaseName: databaseName,
                type: 'database'
            });
        }
    }
    
    return aliases;
}

/**
 * Check if a word is a reserved SQL keyword
 */
function isReservedKeyword(word) {
    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
        'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'UNION', 'ALL', 'DISTINCT',
        'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'VIEW',
        'INDEX', 'DATABASE', 'SCHEMA', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'AS',
        'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'LIMIT', 'OFFSET', 'CASE', 'WHEN',
        'THEN', 'ELSE', 'END', 'IF', 'TRUE', 'FALSE'
    ];
    
    return keywords.includes(word.toUpperCase());
}

/**
 * Create completion items for aliases
 */
export function createAliasCompletionItems(aliases) {
    return aliases.map(alias => ({
        label: alias.alias,
        kind: languages.CompletionItemKind.Reference,
        detail: `${alias.type} alias for ${alias.tableName || alias.databaseName}`,
        sortText: '0' + alias.alias, // Higher priority than regular completions
        documentation: `Alias: ${alias.alias} → ${alias.tableName || alias.databaseName}`
    }));
}

/**
 * Check if current position is after an alias dot notation
 * e.g., "alias." should suggest columns from the aliased table
 */
export function isAfterAliasDot(sqlText, position) {
    const textBeforePosition = sqlText.substring(0, position);
    const aliasPattern = /(\w+)\.$/;
    const match = textBeforePosition.match(aliasPattern);
    
    if (match) {
        const potentialAlias = match[1];
        const aliases = extractTableAliases(sqlText);
        return aliases.find(alias => alias.alias === potentialAlias);
    }
    
    return null;
}