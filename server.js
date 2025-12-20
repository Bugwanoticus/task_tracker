// server.js
const express = require("express");
const path = require("path");

const db = require("./backend/db/connection");
const initSchema = require("./backend/db/schema");
initSchema(db);

const authRoutes = require("./backend/routes/auth.routes");
const websiteRoutes = require("./backend/routes/website.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serve static frontend
app.use(express.static(path.join(__dirname, "frontend", "public_pages")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "frontend", "public_pages", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "frontend", "public_pages", "signup.html")));
app.get("/reset", (req, res) => res.sendFile(path.join(__dirname, "frontend", "public_pages", "password_reset.html")));
app.get("/lists", (req, res) => res.sendFile(path.join(__dirname, "frontend", "public_pages", "index.html")));
app.get("/tasks", (req, res) => res.sendFile(path.join(__dirname, "frontend", "public_pages", "tasks.html")));

// mount API routes
app.use("/api", authRoutes);
app.use("/api", websiteRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
