import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from './db';

console.log('🚀 Running migrations...');

try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  sqlite.close();
}