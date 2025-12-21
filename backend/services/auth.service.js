// backend/services/auth.service.js
const bcrypt = require("bcrypt");

function validateSignup(username, password) {
    const errors = {};

    if (!username) {
       errors.username = ["Username and password are required"];
    } else {
        errors.username = [];
    if (username.length < 3) 
        errors.username.push("Username must be at least 3 characters long");
    if (username.length > 12) 
        errors.username.push("Username must be at most 12 characters long");
    }

    if (!password) {
        errors.password = ["Password is required"];
    } else {
        errors.password = [];
    if (password.length < 6) 
        errors.password.push("Password must be at least 6 characters long");
    if (password.length > 20) 
        errors.password.push("Password must be at most 20 characters long");
    if (!/[A-Za-z]/.test(password)) 
        errors.password.push("Password must contain at least one letter");
    if (!/[0-9]/.test(password)) 
        errors.password.push("Password must contain at least one number");
    if (!/[!@#$%^&*()]/.test(password)) 
        errors.password.push("Password must contain at least one special character");
}
    if (errors.username?.length  === 0) delete errors.username;
    if (errors.password?.length === 0) delete errors.password;

    return Object.keys(errors).length ? errors : null;
    }


async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, password_hash) {
  return bcrypt.compare(password, password_hash);
}

module.exports = { validateSignup, hashPassword, verifyPassword };
