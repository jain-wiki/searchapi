import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Spellfix1 virtual table for spell correction and fuzzy matching
// Note: This represents the structure, but spellfix1 tables need to be created with raw SQL
export const Vocab = sqliteTable('vocab', {
  // Primary columns for spellfix1
  word: text('word').notNull(), // The vocabulary word
  rank: integer('rank').default(1), // Frequency/importance rank (higher = more common)
  langid: integer('langid').default(0), // Language ID (0 = default language)

  // Optional column for handling difficult spellings
  soundslike: text('soundslike'), // Alternative spelling for phonetic matching
});

// Zod schemas for validation
export const insertVocabSchema = createInsertSchema(Vocab);
export const selectVocabSchema = createSelectSchema(Vocab);

// Types
export type VocabQuery = typeof Vocab.$inferSelect;
export type VocabNew = typeof Vocab.$inferInsert;

// Spellfix1 virtual table creation SQL (use this in migrations)
// This will create the actual spellfix1 virtual table
export const createVocabSpellfix1Table = `
  CREATE VIRTUAL TABLE IF NOT EXISTS vocab USING spellfix1;
`;

// Helper SQL to populate vocab table from text table
// This extracts unique words from various text fields with frequency-based ranking
export const populateVocabFromTextTable = `
  -- Insert words from name field
  INSERT OR IGNORE INTO vocab(word, rank)
  SELECT DISTINCT LOWER(TRIM(name)) as word, COUNT(*) as rank
  FROM text
  WHERE name IS NOT NULL AND TRIM(name) != ''
  GROUP BY LOWER(TRIM(name));
`;

// Example queries for using the spellfix1 vocab table
export const vocabExampleQueries = {
  // Find spelling corrections (returns up to 20 matches by default)
  findCorrections: (word: string) => `
    SELECT word, rank, distance, score
    FROM vocab
    WHERE word MATCH '${word}'
    ORDER BY score ASC;
  `,

  // Prefix search
  findPrefix: (prefix: string) => `
    SELECT word, rank, distance, score
    FROM vocab
    WHERE word MATCH '${prefix}*'
    ORDER BY score ASC;
  `,

  // Limit results
  findTopMatches: (word: string, limit: number) => `
    SELECT word, rank, distance, score
    FROM vocab
    WHERE word MATCH '${word}' AND top=${limit}
    ORDER BY score ASC;
  `,
};



