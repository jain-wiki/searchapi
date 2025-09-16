import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Example search-related table - modify as needed
export const Item = sqliteTable('item', {
  id: int('id').primaryKey(),
  d: text('d', { mode: 'json' }), // Store JSON results
});

// Zod schemas for validation
export const insertItemSchema = createInsertSchema(Item);
export const selectItemSchema = createSelectSchema(Item);

// Types
export type ItemQuery = typeof Item.$inferSelect;
export type ItemNew = typeof Item.$inferInsert;