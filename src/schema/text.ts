import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// FTS5 virtual table for full-text search
// Note: This represents the structure, but FTS5 tables need to be created with raw SQL
export const Text = sqliteTable('text', {
  id: text('id').primaryKey(), // 1:1 relationship with item table
  name: text('name'),
  place: text('place'),
  deity: text('deity'),
  sect: text('sect'),
  typeof: text('typeof'),
});

// Zod schemas for validation
export const insertTextSchema = createInsertSchema(Text);
export const selectTextSchema = createSelectSchema(Text);

// Types
export type TextQuery = typeof Text.$inferSelect;
export type TextNew = typeof Text.$inferInsert;

// FTS5 virtual table creation SQL (use this in migrations)
export const createTextFTS5Table = `
  CREATE VIRTUAL TABLE IF NOT EXISTS text USING fts5(
    id,
    name,
    place,
    deity,
    sect,
    typeof
  );
`;

