import { sqliteTable, real, int } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// R-tree virtual table for spatial/geolocation queries
// Note: This represents the structure, but R-tree tables need to be created with raw SQL
export const Geolocation = sqliteTable('geolocation', {
  id: int('id').primaryKey(), // Integer primary key
  minX: real('minX').notNull(), // Minimum X coordinate (longitude)
  maxX: real('maxX').notNull(), // Maximum X coordinate (longitude)
  minY: real('minY').notNull(), // Minimum Y coordinate (latitude)
  maxY: real('maxY').notNull(), // Maximum Y coordinate (latitude)
});

// Zod schemas for validation
export const insertGeolocationSchema = createInsertSchema(Geolocation);
export const selectGeolocationSchema = createSelectSchema(Geolocation);

// Types
export type GeolocationQuery = typeof Geolocation.$inferSelect;
export type GeolocationNew = typeof Geolocation.$inferInsert;

// R-tree virtual table creation SQL (use this in migrations)
export const createGeolocationRTreeTable = `
  CREATE VIRTUAL TABLE IF NOT EXISTS geolocation USING rtree(
    id,
    minX, maxX,
    minY, maxY
  );
`;