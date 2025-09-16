// ref: https://bun.sh/docs/api/sqlite.md

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

// Create SQLite database connection
export const sqlite = new Database('./local.db', { create: true });

// Create Drizzle database instance
export const db = drizzle(sqlite);


