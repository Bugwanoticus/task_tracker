const express = require('express');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("server.db")


const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public_pages')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public_pages", "index.html"));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_pages', "edit.html"));
});
//signup route
const bcrypt = require('bcrypt');
app.post('/api/signup', async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  if (password.length > 14) {
    return res.status(400).json({ error: "Password must be at most 14 characters long" });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one number" });
  }
  if (!/[!@#$%^&*()]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one special character" });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }
  if (username.length > 12) {
    return res.status(400).json({ error: "Username must be at most 12 characters long" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ success: true, user_Id: this.lastID, username });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: "failed to create account" });
  }
});

//login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  db.get(
    "SELECT id, password_hash FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      res.json({ success: true, user_Id: user.id });
    }
  );
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