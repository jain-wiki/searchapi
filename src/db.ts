// ref: https://bun.sh/docs/api/sqlite.md

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

const isReadOnly = process.env.IS_DB_READONLY === 'true';

// Create SQLite database connection
export const sqlite = new Database('./local.db', { create: true, readonly: isReadOnly });

try {
  // Load the spellfix1 extension shared library from the current directory.
  // SQLite will auto-resolve the correct suffix per OS (so/dylib/dll).
  sqlite.loadExtension('./sqlite/spellfix');
  console.log('OK: spellfix1 extension loaded');
} catch (err) {
  console.error('ERROR: Failed to load spellfix1 extension:', err);
  throw new Error('Failed to load spellfix1 extension', { cause: err });
}


// Create Drizzle database instance
export const db = drizzle(sqlite);


