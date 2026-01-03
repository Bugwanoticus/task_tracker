console.log("Signup page loaded");

//displays validation errors on the form
function showErrors(errors) {
    document.querySelectorAll("[data-error-for]").forEach(el => {
        el.textContent = "";
    });

    Object.entries(errors).forEach(([field, messages]) => {
        const el = document.querySelector(
            `[data-error-for="${field}"]`
        );
        if (el) {
            el.textContent = Array.isArray(messages) 
                ? messages.join(", ") 
                : String(messages);
        }
    });
}

//resetting previous errors

function showServerError(err) {
    console.error("Server error:", err);

    const el = document.getElementById("global-error");
    if (!el) return;

    if (typeof err === "string") {
        el.textContent = err;
    } else {
        el.textContent = "An unknown error occurred.";
    }
}

document
    .getElementById("signup-form")
    .addEventListener("submit", async (e) => {
        console.log("Signup form intercepted");
        e.preventDefault();

        document.getElementById("global-error").textContent = "";
    try {
        const signupData = {
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value,
            confirm_password: document.getElementById("confirm_password").value,
            email: document.getElementById("email").value.trim()
        };

        const errors = validateSignup(signupData); 
        if (errors) {
            showErrors(errors);
            return;
        }

        const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData)
        });

        const data = await res.json();

        if (!res.ok) {
            if (data.errors) {
                showErrors(data.errors);
            } else {
                showServerError("Signup failed. Please try again.");
            }
        }

        window.location.href = "/";

    } catch (err) {
        showServerError(err);
      }
    });




//checks validation of signup data
function validateSignup({username, password, confirm_password, email}) {
    const errors = {};

        const usernameErrors = [];
    if (!username) {
       usernameErrors.push("Username is required");
    } else {
        if (username.length < 3) 
            usernameErrors.push("Username must be at least 3 characters long");
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
        if (!/[A-Za-z]/.test(password)) 
            passwordErrors.push("Password must contain at least one letter");
        if (!/[0-9]/.test(password)) 
            passwordErrors.push("Password must contain at least one number");
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
    }
    if (emailErrors.length > 0) {
        errors.email = emailErrors
    }

    return Object.keys(errors).length ? errors : null;
}