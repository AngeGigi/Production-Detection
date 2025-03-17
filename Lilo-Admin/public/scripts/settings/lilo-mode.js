const liloModeModal = document.getElementById("liloModeModal");
const liloModeOverlay = document.getElementById("liloModeOverlay");

$(document).ready(function () {
    $("#lilo-mode-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        liloModeModal.style.display = "block";
        liloModeOverlay.style.display = "block";
        setTimeout(() => {
            liloModeModal.classList.add("show");
            liloModeOverlay.classList.add("show");
        }, 10);
    });

    closeLiloModeModal();
});

liloModeOverlay.addEventListener("click", closeLiloModeModal);

function closeLiloModeModal() {
    console.log("Inside closeLiloModeModal function");
    liloModeModal.classList.remove("show");
    liloModeOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        liloModeModal.style.display = "none";
        liloModeOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
