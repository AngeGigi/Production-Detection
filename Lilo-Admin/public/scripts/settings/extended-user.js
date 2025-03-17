const extUserModal = document.getElementById("extUserModal");
const extUserOverlay = document.getElementById("extUserOverlay");

$(document).ready(function () {
    $("#ext-user-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        extUserModal.style.display = "block";
        extUserOverlay.style.display = "block";
        setTimeout(() => {
            extUserModal.classList.add("show");
            extUserOverlay.classList.add("show");
        }, 10);
    });

    closeExtUserModal();
});

extUserOverlay.addEventListener("click", closeExtUserModal);

function closeExtUserModal() {
    console.log("Inside closeExtUserModal function");
    extUserModal.classList.remove("show");
    extUserOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        extUserModal.style.display = "none";
        extUserOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
