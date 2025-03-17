window.onload = function () {
    const videoElement = document.getElementById("camera-feed");
    const photoToggle = document.getElementById("photoToggle");
    const photoToggleText = document.getElementById("photoToggleText");
    const base64ImageInput = document.getElementById("base64Image");
    const capturedPhoto = document.getElementById("captured-photo");
    const canvas = document.getElementById("canvas");
    const captureButtonContainer = document.getElementById("capture-container");
    const capturePhotoBtn = document.getElementById("capturePhotoBtn");
    const employeeImage = document.getElementById("employeeImage");
    let cameraStream = null;

    // Start and stop camera
    function startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    cameraStream = stream;
                    videoElement.style.display = "block";
                    videoElement.srcObject = stream;
                    captureButtonContainer.classList.toggle("d-none"); // Show the capture button
                })
                .catch(function (error) {
                    console.log("Camera not found: ", error);
                    alert("Camera not detected.");
                });
        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            videoElement.style.display = "none";
            videoElement.srcObject = null;
            captureButtonContainer.classList.toggle("d-none"); // Hide the capture button
        }
    }

    // Handle toggle for photo
    photoToggle.addEventListener("change", () => {
        if (photoToggle.checked) {
            photoToggleText.innerText = "Enroll With Photo";
            startCamera();
        } else {
            photoToggleText.innerText = "Enroll Without Photo";
            stopCamera();
            base64ImageInput.value = null;
            employeeImage.style.display = "none"; // Hide the captured image
        }
    });

    // Capture the photo when the button is clicked
    capturePhotoBtn.addEventListener("click", function () {
        const canvas = document.getElementById("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
        // Get base64 image
        const dataUrl = canvas.toDataURL("image/png");
    
        // Remove the "data:image/png;base64," part from the base64 string
        const base64Image = dataUrl.split(",")[1];
    
        // Set the cleaned base64 string without the prefix
        base64ImageInput.value = base64Image;
    
        // Update the captured-photo src with the image
        capturedPhoto.src = dataUrl;
        capturedPhoto.style.display = "block"; // Show the captured photo
    
        // Hide the video and capture button
        videoElement.style.display = "none";
        captureButtonContainer.classList.toggle("d-none");
    });
    

    // Stop the camera on page unload
    window.addEventListener("beforeunload", stopCamera);
};



    // Function to validate Employee ID and Email
    async function validateInputs() {
        const compCode = document.getElementById("compCode").value;
        const empID = document.getElementById("empID").value;
        const email = document.getElementById("email").value;
        const empIDError = document.getElementById("empIDError");
        const emailError = document.getElementById("emailError");

        // Clear previous error messages
        empIDError.style.display = "none";
        emailError.style.display = "none";

        let valid = true;

        // Validate Employee ID
        if (!empID) {
            empIDError.textContent = "Employee ID is required.";
            empIDError.style.display = "block";
            valid = false;
        } else {
            try {
                const response = await fetch(`/homepage/check-empid?empID=${empID}`);
                const result = await response.json();

                if (result.exists) {
                    empIDError.textContent = "Employee ID already exists.";
                    empIDError.style.display = "block";
                    valid = false;
                }
            } catch (error) {
                console.error("Error checking Employee ID:", error);
                empIDError.textContent = "Error checking Employee ID.";
                empIDError.style.display = "block";
                valid = false;
            }
        }

        // Validate Email Format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email address.";
            emailError.style.display = "block";
            valid = false;
        }

        return valid;
    }

    // Attach input event listeners for validation
    document.getElementById("empID").addEventListener("input", validateInputs);
    document.getElementById("email").addEventListener("input", validateInputs);

    // Form submission with validation
    // Form submission with validation
document.addEventListener("DOMContentLoaded", function () {
    const addform = document.getElementById("addEmployee");
    const registerBtn = document.getElementById("register-btn"); // Reference to the button outside the form

    registerBtn.addEventListener("click", async function () {
        // Trigger form submission
        if (!(await validateInputs())) {
            return; // Prevent form submission if validation fails
        }

        const params = new URLSearchParams(window.location.search);
        const view = params.get("view") || "card";

        const compCode = document.getElementById("compCode").value;
        const empID = document.getElementById("empID").value;
        const fname = document.getElementById("fname").value;
        const mname = document.getElementById("mname").value;
        const lname = document.getElementById("lname").value;
        const dept = document.getElementById("oldDept").value;
        const email = document.getElementById("email").value;
        const loc_assign_select = document.getElementById("loc_assign");
        const loc_assign = loc_assign_select.options[loc_assign_select.selectedIndex]?.getAttribute("data-id");
        const empPic = document.getElementById("base64Image").value;

        try {
            const response = await fetch(`/homepage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    compCode,
                    empID,
                    fname,
                    mname,
                    lname,
                    dept,
                    email,
                    loc_assign,
                    empPic,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Server error: ${response.status} - ${response.statusText}`);
                console.error(`Error response text: ${errorText}`);
                throw new Error(`Failed to add employee: ${response.statusText}`);
            }

            const responseData = await response.json();
            alert(responseData.message);

            const modal = new bootstrap.Modal(document.getElementById("singleRegisterModal"));
            modal.hide();

            if (view === "list") {
                window.location.href = "/homepage?view=list";
            } else if (view === "card") {
                window.location.href = "/homepage?view=card";
            }
        } catch (error) {
            console.error("Error registering employee:", error.message);
            alert("Error registering employee. Please try again.");
        }
    });
});



    function closeAddModal() {
        modal.classList.remove("show");
        overlay.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            overlay.style.display = "none";
        }, 300);
        stopCamera(); // Stop the camera when the modal is closed
    }