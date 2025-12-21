// backend/services/auth.service.js
const bcrypt = require("bcrypt");

function validateSignup(username, password) {
    const errors = {};

    if (!username) {
        errors.username = "Username and password are required";
    } else {
    if (username.length < 3) 
        errors.username = "Username must be at least 3 characters long";
    if (username.length > 12) 
        errors.username = "Username must be at most 12 characters long";
    }

    if (!password) {
        errors.password = "Password is required";
    } else {
    if (password.length < 6) 
        errors.password = "Password must be at least 6 characters long";
    if (password.length > 14) 
        errors.password = "Password must be at most 14 characters long";
    if (!/[0-9]/.test(password)) 
        errors.password = "Password must contain at least one number";
    if (!/[!@#$%^&*()]/.test(password)) 
        errors.password = "Password must contain at least one special character";
}

    return Object.keys(errors).length ? errors : null;
    }

    
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, password_hash) {
  return bcrypt.compare(password, password_hash);
}

module.exports = { validateSignup, hashPassword, verifyPassword };
