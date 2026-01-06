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


// generates a 6-digit code as a string
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();   
}

//hashes the 6digit code
const crypto = require("crypto");
function hashCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
}

//sends an email verification code
async function sendEmailVerificationCode(email) {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.email_verified == 1) {
        return;
    }

        await db.run(
        "DELETE FROM email_verification WHERE user_id = ? AND purpose = ?",
        [user.id, "email_verify"]
    );

        const code = generateCode();
        const codeHash = hashCode(code);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
        await insertVerificationCode({
            userId: user.id,
            codeHash,
            expiresAt,
            purpose: "email_verify"
        });

        await sendEmail(email, code);
    }

    //sends a password reset code to the user's email
async function sendPasswordResetCode(email) {
    const user = await getUserByEmail(email);
    if (!user) return;

    await db.run(
        "DELETE FROM email_verification WHERE user_id = ? AND purpose = ?",
        [user.id, "password_reset"]
    );

        const code = generateCode();
        const codeHash = hashCode(code);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        await insertVerificationCode({
            userId: user.id,
            codeHash,
            expiresAt,
            purpose: "password_reset"
        });

        await sendEmail(email, code);
    }

// verify the code that was sent
async function verifyCode(email, code, purpose) {
    const user = await getUserByEmail(email);

    if (!user) {
        throw new Error("User not found");
}

    const codeHash = hashCode(code);
    const verification = await db.get(
        "SELECT * FROM email_verification WHERE user_id = ? AND code_hash = ? AND purpose = ?",
        [user.id, codeHash, purpose]
    );

    if (!verification) {
        throw new Error("Invalid or expired verification code");
    }

    if (new Date(verification.expires_at) < new Date()) {
        throw new Error("Verification code has expired");
    }

    await db.run(
        "DELETE FROM email_verification WHERE id = ?",
        [verification.id]
    );
}

//change email verify state
async function markEmailAsVerified(email) {
    if (!userId) return;
    await authservice.verifyCode(email, code, "email_verify");
    await db.run(
        "UPDATE users SET email_verified = 1 WHERE id = ?",
        [email]
    );
}

module.exports = { validateSignup, hashPassword, verifyPassword, generateCode, hashCode, sendEmailVerificationCode, sendPasswordResetCode };