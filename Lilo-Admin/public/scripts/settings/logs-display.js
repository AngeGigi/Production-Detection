const logsDisplayModal = document.getElementById("logsDisplayModal");
const logsDisplayOverlay = document.getElementById("logsDisplayOverlay");

$(document).ready(function () {
    $("#logs-display-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        logsDisplayModal.style.display = "block";
        logsDisplayOverlay.style.display = "block";
        setTimeout(() => {
            logsDisplayModal.classList.add("show");
            logsDisplayOverlay.classList.add("show");
        }, 10);
    });

    closeLogsDisplay();
});

logsDisplayOverlay.addEventListener("click", closeLogsDisplay);

function closeLogsDisplay() {
    console.log("Inside closeLogsDisplay function");
    logsDisplayModal.classList.remove("show");
    logsDisplayOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        logsDisplayModal.style.display = "none";
        logsDisplayOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
