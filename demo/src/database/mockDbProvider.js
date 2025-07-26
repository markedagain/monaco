// Example of how to configure database providers
// In a real app, these would make API calls to your backend

/**
 * Mock database provider that simulates API calls
 */
export class MockDatabaseProvider {
  constructor() {
    // Simulate real database schema
    this.schema = {
      catalogs: ['production', 'staging', 'development'],
      databases: {
        production: ['users_db', 'orders_db', 'analytics_db'],
        staging: ['users_db', 'orders_db'],
        development: ['users_db']
      },
      tables: {
        users_db: ['users', 'user_profiles', 'user_sessions'],
        orders_db: ['orders', 'order_items', 'payments'],
        analytics_db: ['events', 'user_metrics', 'sales_reports']
      },
      columns: {
        users: [
          { name: 'id', type: 'BIGINT' },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'first_name', type: 'VARCHAR(100)' },
          { name: 'last_name', type: 'VARCHAR(100)' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP' }
        ],
        orders: [
          { name: 'id', type: 'BIGINT' },
          { name: 'user_id', type: 'BIGINT' },
          { name: 'total_amount', type: 'DECIMAL(10,2)' },
          { name: 'status', type: 'VARCHAR(50)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ],
        user_profiles: [
          { name: 'user_id', type: 'BIGINT' },
          { name: 'bio', type: 'TEXT' },
          { name: 'avatar_url', type: 'VARCHAR(500)' },
          { name: 'preferences', type: 'JSON' }
        ]
      }
    };
  }

  // Simulate API delay
  async delay(ms = 100) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCatalogs(languageId) {
    await this.delay();
    console.log('🗄️ Fetching catalogs for', languageId);
    return this.schema.catalogs;
  }

  async getDatabases(languageId, catalog) {
    await this.delay();
    console.log('🗃️ Fetching databases for catalog:', catalog);
    
    if (!catalog) {
      // Return all databases
      return Object.values(this.schema.databases).flat();
    }
    
    return this.schema.databases[catalog] || [];
  }

  async getTables(languageId, catalog, database) {
    await this.delay();
    console.log('📊 Fetching tables for database:', database);
    
    if (!database) {
      // Return all tables
      return Object.values(this.schema.tables).flat();
    }
    
    return this.schema.tables[database] || [];
  }

  async getColumns(languageId, catalog, database, table) {
    await this.delay();
    console.log('📋 Fetching columns for table:', table);
    
    return this.schema.columns[table] || [
      { name: 'id', type: 'BIGINT' },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'created_at', type: 'TIMESTAMP' }
    ];
  }
}

/**
 * Example configuration using static data
 */
export const staticDatabaseConfig = {
  // Static data approach - faster but less flexible
  catalogs: ['my_catalog', 'shared_catalog'],
  tmpDatabases: ['user_db', 'product_db', 'analytics_db'],
  tmpTables: ['users', 'products', 'orders', 'reviews'],
  tableColumns: {
    users: ['id', 'username', 'email', 'created_at'],
    products: ['id', 'name', 'price', 'category_id', 'stock'],
    orders: ['id', 'user_id', 'product_id', 'quantity', 'total'],
    reviews: ['id', 'user_id', 'product_id', 'rating', 'comment']
  }
};

/**
 * Example configuration using API calls
 */
export function createApiDatabaseConfig(apiBaseUrl, apiKey) {
  return {
    catalogProvider: async (languageId) => {
      const response = await fetch(`${apiBaseUrl}/catalogs?lang=${languageId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    },
    
    databaseProvider: async (languageId, catalog) => {
      const url = catalog 
        ? `${apiBaseUrl}/databases?catalog=${catalog}&lang=${languageId}`
        : `${apiBaseUrl}/databases?lang=${languageId}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    },
    
    tableProvider: async (languageId, catalog, database) => {
      const params = new URLSearchParams({ lang: languageId });
      if (catalog) params.set('catalog', catalog);
      if (database) params.set('database', database);
      
      const response = await fetch(`${apiBaseUrl}/tables?${params}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    },
    
    columnProvider: async (languageId, catalog, database, table) => {
      const params = new URLSearchParams({ lang: languageId, table });
      if (catalog) params.set('catalog', catalog);
      if (database) params.set('database', database);
      
      const response = await fetch(`${apiBaseUrl}/columns?${params}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return response.json();
    }
  };
}