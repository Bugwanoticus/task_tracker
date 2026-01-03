console.log("🔥 AUTH SERVICE LOADED - NEW VERSION");

// backend/services/auth.service.js
const bcrypt = require("bcrypt");

function validateSignup({username, password, confirm_password, email}) {
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
    if (usernameErrors.length > 0) {
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
    if (passwordErrors.length > 0) {
        errors.password = passwordErrors;
}


    const confirmPasswordErrors = [];
    if (!confirm_password) {
        confirmPasswordErrors.push("Confirm password is required");
    } else {
        if (confirm_password && password !== confirm_password)
            confirmPasswordErrors.push("Password and confirm password must match")
}
    if (confirmPasswordErrors.length > 0) {
        errors.confirm_password = confirmPasswordErrors;
    }


    const emailErrors = [];
    if (!email) {
        emailErrors.push("Email is required");
    } else if   (!/^\S+@\S+\.\S+$/.test(email)) {
        emailErrors.push("Email must be a valid address");
    }
    if (emailErrors.length > 0) {
        errors.email = emailErrors
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
