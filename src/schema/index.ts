import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';



// Example search-related table - modify as needed
export const searchQueries = sqliteTable('search_queries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  results: text('results', { mode: 'json' }), // Store JSON results

});

// Zod schemas for validation
export const insertSearchQuerySchema = createInsertSchema(searchQueries);
export const selectSearchQuerySchema = createSelectSchema(searchQueries);

// Types
export type SearchQuery = typeof searchQueries.$inferSelect;
export type NewSearchQuery = typeof searchQueries.$inferInsert;