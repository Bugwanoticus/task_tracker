// backend/services/auth.service.js
const bcrypt = require("bcrypt");

function validateSignup(username, password) {
    const errors = {};

    const usernameErrors = [];
    if (!username) {
       usernameErrors.push("Username is required");
    } else {
     if (username.length < 3) 
        usernameErrors.push("Username must be at least 3 characters long");
     if (username.length > 12) 
        usernameErrors.push("Username must be at most 12 characters long");
    }
    if (usernameErrors.length) {
        errors.username = usernameErrors;
    }

    const passwordErrors = [];
    if (!password) {
        passwordErrors.push("Password is required");
    } else {
    if (password.length < 6) 
        passwordErrors.push("Password must be at least 6 characters long");
    if (password.length > 20) 
        passwordErrors.push("Password must be at most 20 characters long");
    if (!/[A-Za-z]/.test(password)) 
        passwordErrors.push("Password must contain at least one letter");
    if (!/[0-9]/.test(password)) 
        passwordErrors.push("Password must contain at least one number");
    if (!/[!@#$%^&*()]/.test(password)) 
        passwordErrors.push("Password must contain at least one special character");
}
    if (passwordErrors.length) {
        errors.password = passwordErrors;
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
