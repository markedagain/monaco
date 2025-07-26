// Export all helpers
export * from './helpers/completionService';
export * from './helpers/dbMetaProvider';
export * from './helpers/aliasExtractor';

// Export language setup
export { setupLanguages } from './languages/setup';
export { setupLanguageWorkers } from './languages/languageWorker';

// Re-export commonly used enums from monaco-sql-languages
export { EntityContextType, StmtContextType, LanguageIdEnum } from 'monaco-sql-languages/esm/main';