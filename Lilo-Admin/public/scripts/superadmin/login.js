const form = document.getElementById("loginForm");
const user_input = document.getElementById("username");
const password_input = document.getElementById("password");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous error messages and styles
    error_message.innerText = "";
    resetInputStyles();

    // Validate form inputs
    let errors = getLoginFormErrors(user_input.value, password_input.value);

    // Proceed if no errors
    if (errors.length === 0) {
        try {
            // Send login request using Fetch API
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user_input.value,
                    password: password_input.value,
                }),
            });

            const result = await response.json();

            if (result.isSuccess) {
                sessionStorage.setItem("token", result.supertoken);
                window.location.href = "/superadmin/dashboard";
            } else {
                errors.push(result.message);
            }
        } catch (error) {
            errors.push("Login failed. Please try again.");
        }
    }

    // Display errors if any
    if (errors.length > 0) {
        error_message.innerText = errors.join(". ");
    }
});

// Function to validate form inputs
function getLoginFormErrors(username, password) {
    let errors = [];
    if (username === "") {
        errors.push("Username is required");
        user_input.parentElement.classList.add("incorrect");
    }
    if (password === "") {
        errors.push("Password is required");
        password_input.parentElement.classList.add("incorrect");
    }
    return errors;
}

// Function to reset input styles
function resetInputStyles() {
    user_input.parentElement.classList.remove("incorrect");
    password_input.parentElement.classList.remove("incorrect");
}
