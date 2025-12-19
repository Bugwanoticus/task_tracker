const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbpath = path.join(__dirname, 'server.db');
const db = new sqlite3.Database(dbpath);

db.exec("PRAGMA foreign_keys = ON;");

module