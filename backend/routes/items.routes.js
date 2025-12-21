const express = require('express');
const router = express.Router();
const db = require('../db/connection');


// API/USERS
// GET /api/users
router.get('/users', (req, res) => {
  db.all("SELECT id, name FROM users ORDER BY id ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/users
router.post('/users', (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "INSERT INTO users (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

// POST /api/users/delete
router.post('/users/delete', (req, res) => {
  const id = Number(req.body.id);
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });
});



// API/LISTS
// GET /api/lists
router.get('/', (req, res) => {
  db.all("SELECT id, name FROM lists ORDER BY id ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/lists
router.post('/', (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "INSERT INTO lists (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });  
    });
});

// POST /api/lists/delete
router.post('/lists/delete', (req, res) => {
  const id = Number(req.body.id);

  db.run("DELETE FROM lists WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
    }
    });
});



// API/TASKS
//GET /api/tasks
router.get('/tasks', (req, res) => {
  db.all("SELECT id, name FROM tasks ORDER BY id ASC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/tasks
router.post('/tasks', (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: "Name is required" });
  db.run(
    "INSERT INTO tasks (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });  
    });
});

// POST /api/tasks/delete
router.post('/tasks/delete', (req, res) => {
  const id = Number(req.body.id);

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });
});

module.exports = router;