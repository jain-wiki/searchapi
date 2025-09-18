#!/usr/bin/env bun
// file: test-spellfix1-bun.js
import { Database } from "bun:sqlite";

function log(...args) { console.log(...args); }

const db = new Database(":memory:");

try {
  // Load the spellfix1 extension shared library from the current directory.
  // SQLite will auto-resolve the correct suffix per OS (so/dylib/dll).
  db.loadExtension("./sqlite/spellfix");
  log("OK: spellfix1 extension loaded");
} catch (err) {
  console.error("ERROR: Failed to load spellfix1 extension:", err);
  console.error("Hints:");
  console.error("- Ensure spellfix1 was compiled to spellfix.so/.dylib/.dll in this directory.");
  console.error("- On macOS, use a custom SQLite build and configure Database.setCustomSQLite() before loading.");
  process.exit(1);
}

// Create a spellfix1 virtual table and seed a tiny vocabulary
db.run("CREATE VIRTUAL TABLE demo USING spellfix1;");
const insert = db.query("INSERT INTO demo(word, rank) VALUES (?, ?)");
insert.run("palitana", 100);
insert.run("shatrunjaya", 80);
insert.run("jain", 200);
insert.run("temple", 150);

// Try a misspelled query token and get top candidates
const misspelled = "palitnaa";
const candidates = db
  .query("SELECT word, distance, score FROM demo WHERE word MATCH ? AND top=5;")
  .all(misspelled);

log(`Candidates for "${misspelled}":`, candidates);

// Optionally, show the edit distance function from the extension
const dist = db
  .query("SELECT spellfix1_editdist(?, ?) AS d;")
  .get(misspelled, "palitana");
log(`Edit distance (${misspelled} -> palitana):`, dist.d);

// Clean up
db.close();
