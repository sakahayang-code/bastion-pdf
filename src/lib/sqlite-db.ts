import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'data/replica.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}
