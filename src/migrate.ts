import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db, sqlite } from './db';
import { populateVocabFromTextTable } from './schema/vocab.ts';

console.log('🚀 Running migrations...');

try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migrations completed successfully');
  // console.log('🚀 Populating vocabulary table...');
  // sqlite.run(populateVocabFromTextTable);
  // console.log('✅ Vocabulary table populated successfully');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  sqlite.close();
}