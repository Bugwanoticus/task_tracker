// server.js
const express = require("express");
const path = require("path");

const db = require("./backend/db/connection");
const initSchema = require("./backend/db/schema");
initSchema(db);

const authRoutes = require("./backend/routes/auth.routes");
const itemsRoutes = require("./backend/routes/items.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// serve static frontend
app.use(express.static(path.join(__dirname, "frontend", "public_pages")));

//login logic
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "frontend", "login_page", "index.html")));

//signup logic
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "frontend", "signup_page", "signup.html")));
app.get("/signup.js", (req, res) => res.sendFile(path.join(__dirname, "frontend", "signup_page", "signup.js")));
app.get("/signup.css", (req, res) => res.sendFile(path.join(__dirname, "frontend", "signup_page", "signup.css")));



//password reset logic
app.get("/reset", (req, res) => res.sendFile(path.join(__dirname, "frontend", "password_page", "password_reset.html")));

//tasks page logic
app.get("/tasks", (req, res) => res.sendFile(path.join(__dirname, "frontend", "tasks_page", "tasks.html")));


// mount API routes
app.use("/api", authRoutes);
app.use("/api", itemsRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
