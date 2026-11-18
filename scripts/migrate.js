const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../data/replica.db');
const SCHEMA_PATH = path.join(__dirname, '../replica/schema-sqlite.sql');

console.log(`[migrate] Connecting to SQLite at: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);

console.log(`[migrate] Reading schema from: ${SCHEMA_PATH}`);
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');

// Execute migrations
db.exec(schemaSql);
console.log(`[migrate] Schema successfully applied to SQLite database.`);

// Verification
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").all();
console.log(`[migrate] Active tables (${tables.length}):`, tables.map(t => t.name).join(', '));
