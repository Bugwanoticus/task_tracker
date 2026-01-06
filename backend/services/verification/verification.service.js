const db = require("../../db/connection.js");
const { generateCode, hashVerificationCode } = require("./code.generation.js");
const authservice = require("../auth.service.js");


//sends an email verification code
async function sendEmailVerificationCode(email) {
    const user = await getUserByEmail(email);

    if (!user || user.email_verified == 1) {
        return;
    }

    await db.run(
        "DELETE FROM email_verification WHERE user_id = ? AND purpose = ?",
        [user.id, "email_verify"]
    );

    const code = generateCode();
    const codeHash = hashVerificationCode(code);
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
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await insertVerificationCode({
        userId: user.id,
        codeHash,
        expiresAt,
        purpose: "password_reset"
    });

    await sendEmail(email, code);
    }

async function verifyEmail({ email, code }) {
    const user = await getUserByEmail(email);

    if (!user) {
        throw new Error("Invalid or expired verification code");
    }

    const codeHash = hashVerificationCode(code);
    const verification = await db.get(
        `SELECT * FROM email_verification 
        WHERE user_id = ?
        AND code_hash = ?
        AND purpose = "email_verify"
        AND expires_at > datetime('now')`,
        [user.id, codeHash]
    );

    if (!verification) {
        throw new Error("Invalid or expired verification code");
    }

    await db.run(
        "UPDATE users SET email_verified = 1 WHERE id = ?",
        [user.id]
    );
    await db.run(
        "DELETE FROM email_verification WHERE id = ?",
        [verification.id]
    );
}

// verify the code that was sent
async function resetPassword({ email, code, newPassword }) {
    const user = await getUserByEmail(email);

    if (!user) {
        throw new Error("Invalid or expired reset code");
}

    const codeHash = hashVerificationCode(code);
    const verification = await db.get(
        `SELECT * FROM email_verification 
        WHERE user_id = ?
        AND code_hash = ?
        AND purpose = "password_reset"
        AND expires_at > datetime('now')`,
        [user.id, codeHash]
    );

    if (!verification) {
        throw new Error("Invalid or expired reset code");
    }
    
    const errors = authservice.validatePassword(newPassword);
    if (errors) {
        throw new Error(errors.password.join(", "));
    }
    const hashedPassword = await authservice.hashPassword(newPassword);
    await db.run(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [hashedPassword, user.id]
    );
    await db.run(
        "DELETE FROM email_verification WHERE id = ?",
        [verification.id]
    );
}


module.exports = { sendEmailVerificationCode, sendPasswordResetCode, verifyEmail, resetPassword };