document.getElementById("forgotPassForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const responseMessageElement = document.getElementById("response-message");
    const instructionElement = document.getElementById("instruction");
    const errorMessageElement = document.getElementById("error-message");
    const form = event.target;

    // Clear previous messages
    responseMessageElement.textContent = "FORGOT PASSWORD";
    responseMessageElement.classList.replace("text-success", "text-primary"); // Reset to default color
    errorMessageElement.textContent = "";

    try {
        // Collect form data
        const formData = new FormData(form);
        const data = {
            username: formData.get("username"),
            email: formData.get("email"),
        };

        // Send an AJAX POST request using fetch
        const response = await fetch(form.action, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Handle server errors
            const errorData = await response.json();
            throw new Error(errorData.error || "An error occurred.");
        }

        // Handle successful response
        const responseData = await response.json();
        responseMessageElement.textContent = responseData.message; // Update the header text
        responseMessageElement.classList.replace("text-primary", "text-success"); // Change text color to success
        instructionElement.textContent = "Password reset link has been sent to your email. Valid for 1 hour only."; // Update the instructions

    } catch (error) {
        // Handle errors
        errorMessageElement.textContent = error.message; // Display error below the form
    }
});
