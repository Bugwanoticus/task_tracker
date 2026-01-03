module.exports = function initializeSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

   CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL
    );

   CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

   CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    priority_level INTEGER NOT NULL DEFAULT 0,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_list_priority_order
    ON tasks(list_id, priority_level, order_index);

    `);
};