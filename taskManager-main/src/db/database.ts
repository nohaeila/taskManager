import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance: any = null;

export const initDatabase = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // Table users
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_login INTEGER DEFAULT 0
    )
  `);

    // Table tasks
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      is_done INTEGER DEFAULT 0,
      userId INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

    // Table collaborators
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS task_collaborators (
      taskId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      PRIMARY KEY (taskId, userId),
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Table refresh_tokens
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  return dbInstance;
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
};