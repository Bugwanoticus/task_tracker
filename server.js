const express = require('express');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("server.db")


const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', "edit.html"));
});

app.get('/api/items', (req, res) => {
  db.all("SELECT id, name FROM items ORDER BY id ASC",
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message});
    }
    res.json(rows);
  });
});


app.post('/api/items', (req, res) => {
    const name = req.body.name?.trim();
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    db.run(
      "INSERT INTO items (name) VALUES (?)",
      [name],
      function (err) {
        if (err) return res.status(500).json({ error: err.message});

        res.status(201).json({ id: this.lastID, name});
      }
    );
  });
    

app.post('/api/items/delete', (req, res) => {
    const id = Number(req.body.id);
    
    db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ error: err.message});

      if(this.changes === 0) {
        return res.status(404).json({ error: "item not found" });
      }

      res.json({ success: true});
    });
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});