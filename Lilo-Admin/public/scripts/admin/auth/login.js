const form = document.getElementById("loginForm");
const user_input = document.getElementById("username");
const password_input = document.getElementById("password");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    error_message.innerText = "";
    let errors = getLoginFormErrors(user_input.value, password_input.value);

    if (errors.length === 0) {
        try {
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
                sessionStorage.setItem("token", result.token);
                window.location.href = "/admin/dashboard";
            } else {
                errors.push(result.message);
            }
        } catch (error) {
            errors.push("Login failed. Please try again.");
        }
    }

    if (errors.length > 0) {
        error_message.innerText = errors.join(". ");
    }
});

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