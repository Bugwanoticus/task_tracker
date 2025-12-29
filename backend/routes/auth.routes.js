// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const authService = require("../services/auth.service.js");



// POST /api/signup
router.post("/signup", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  const errMsg = authService.validateSignup(username, password);
  if (errMsg) return res.status(400).json({ error: errMsg });

  try {
    const hashed = await authService.hashPassword(password);
    db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashed],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ errors: { username: ["Username already exists"] } });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true, user_Id: this.lastID, username });
      }
    );
  } catch {
    res.status(500).json({ error: "failed to create account" });
  }
});



// POST /api/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

  db.get("SELECT id, password_hash FROM users WHERE username = ?", [username.trim()], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid username or password" });

    const ok = await authService.verifyPassword(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid username or password" });

    res.json({ success: true, user_Id: row.id });
  });
});

module.exports = router;
