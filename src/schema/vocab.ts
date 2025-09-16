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

// Helper SQL to populate vocab table from textsearch (FTS5) table
export const populateVocabFromTextTable = `
  -- First create a temporary fts5vocab table to extract vocabulary from the FTS5 index
  CREATE VIRTUAL TABLE IF NOT EXISTS temp.text_vocab USING fts5vocab(textsearch, col);

  -- Insert unique terms from all columns into the vocab spellfix1 table
  -- Use cnt (total occurrences) as rank to favor more common terms
  INSERT OR REPLACE INTO vocab(word, rank, langid)
  SELECT
    term as word,
    SUM(cnt) as rank,  -- Sum occurrences across all columns for total frequency
    0 as langid        -- Default language ID
  FROM temp.text_vocab
  WHERE length(term) >= 3  -- Filter out very short terms
  GROUP BY term           -- Consolidate same terms from different columns
  ORDER BY rank DESC;     -- Insert most frequent terms first

  -- Clean up temporary vocab table
  DROP TABLE IF EXISTS temp.text_vocab;
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



