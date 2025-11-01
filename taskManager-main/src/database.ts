import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize SQLite database
export async function initializeDatabase() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  // Create refresh tokens table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  return db;
}