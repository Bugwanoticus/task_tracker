// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const authService = require("../services/auth.service.js");
const verificationService = require("../services/verification/verification.service.js");
const codegeneration = require("../services/verification/code.generation.js");


// POST /api/signup
router.post("/signup", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;
  const email = req.body.email?.trim();

  const errMsg = authService.validateSignup({username, password, confirm_password, email});
  if (errMsg) return res.status(400).json({ errors: errMsg });

  try {
    const hashed = await authService.hashPassword(password);
    db.run(
      "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
      [username, hashed, email],
      function (err) {
        if (err) {
          if (err.message.includes("users.username")) {
            return res.status(409).json({ errors: { username: ["Username already exists"] } });
          }
          if (err.message.includes("users.email")) {
            return res.status(409).json({ errors: { email: ["Email already registered"] } });
          }
          return res.status(500).json({ errors: { global: ["failed to create account"] } });
        }
        res.status(201).json({ success: true, userId: this.lastID, username });
      }
    );
  } catch {
    res.status(500).json({ errors: { global: ["failed to create account"] } });
  }
});



// POST /api/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ errors: {username: ["Username is required"], password: ["Password is required"] } });

  db.get("SELECT id, password_hash FROM users WHERE username = ?", [username.trim()], async (err, row) => {
    if (err) return res.status(500).json({ errors: { global: ["failed to login"] } });
    if (!row) return res.status(401).json({ errors: { global: ["Invalid username or password"] } });
    const ok = await authService.verifyPassword(password, row.password_hash);
    if (!ok) return res.status(401).json({ errors: { global: ["Invalid username or password"] } });

    res.json({ success: true, user_Id: row.id });
  });
});

// POST /api/send-verification-email
router.post("/send-verification-email", async (req, res) => {
  
  const { email } = req.body;
  try {
    await verificationService.sendEmailVerificationCode(email);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ errors: { global: [err.message] } });
  }
});

// POST /api/send-password-reset
router.post("/send-password-reset", async (req, res) => {
  const { email } = req.body;

  await verificationService.sendPasswordResetCode(email);
  res.json({ success: true });
  });

// POST /api/verify-email
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await verificationService.verifyCode({email, code, purpose: "email_verify"});
    
    await verificationService.markEmailAsVerified(user.id);
    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ errors: { global: [err.message] } });
  }
});

// POST /api/reset
router.post("/password-reset", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await verificationService.verifyCode({email, code, purpose: "password_reset"});

  } catch {
    res.status(400).json({ errors: { global: ["Invalid or expired reset code"] } });
  }
});

module.exports = router;
