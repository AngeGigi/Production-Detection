const logConfigModal = document.getElementById("logConfigModal");
const logConfigOverlay = document.getElementById("logConfigOverlay");

$(document).ready(function () {
    $("#log-config-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        logConfigModal.style.display = "block";
        logConfigOverlay.style.display = "block";
        setTimeout(() => {
            logConfigModal.classList.add("show");
            logConfigOverlay.classList.add("show");
        }, 10);
    });

    closeLogConfigModal();
});

logConfigOverlay.addEventListener("click", closeLogConfigModal);

function closeLogConfigModal() {
    console.log("Inside closeLogConfigModal function");
    logConfigModal.classList.remove("show");
    logConfigOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        logConfigModal.style.display = "none";
        logConfigOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
