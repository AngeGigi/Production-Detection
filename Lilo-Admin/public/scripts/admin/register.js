const form = document.getElementById("form");
const compcode_input = document.getElementById("companycode-input");
const user_input = document.getElementById("user-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const repeat_password_input = document.getElementById("repeat-password-input");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", (e) => {
    let errors = [];

    // Validate registration form inputs
    errors = getSignupFormErrors(
        compcode_input.value,
        user_input.value,
        email_input.value,
        password_input.value,
        repeat_password_input.value
    );

    if (errors.length > 0) {
        // Prevent form submission and show error message
        e.preventDefault();
        error_message.innerText = errors.join(". ");
    }
});

function getSignupFormErrors(firstname, user, password, repeatPassword) {
    let errors = [];

    // Clear previous errors
    allInputs.forEach((input) => input.parentElement.classList.remove("incorrect"));
    error_message.innerText = '';

    if (firstname === "" || firstname == null) {
        errors.push("Company Code is required");
        compcode_input.parentElement.classList.add("incorrect");
    }
    if (user === "" || user == null) {
        errors.push("Username is required");
        user_input.parentElement.classList.add("incorrect");
    }
    if (email === "" || email == null) {
        errors.push("email is required");
        email_input.parentElement.classList.add("incorrect");
    }
    if (password === "" || password == null) {
        errors.push("Password is required");
        password_input.parentElement.classList.add("incorrect");
    }
    if (password.length < 8) {
        errors.push("Password must have at least 8 characters");
        password_input.parentElement.classList.add("incorrect");
    }
    if (password !== repeatPassword) {
        errors.push("Password does not match repeated password");
        password_input.parentElement.classList.add("incorrect");
        repeat_password_input.parentElement.classList.add("incorrect");
    }

    return errors;
}

// Remove error message when user starts typing again
const allInputs = [
    compcode_input,
    user_input,
    email_input,
    password_input,
    repeat_password_input,
].filter((input) => input != null);

allInputs.forEach((input) => {
    input.addEventListener("input", () => {
        if (input.parentElement.classList.contains("incorrect")) {
            input.parentElement.classList.remove("incorrect");
            error_message.innerText = "";
        }
    });
});
