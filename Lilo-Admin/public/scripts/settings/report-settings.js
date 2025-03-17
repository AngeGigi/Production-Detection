const reportSettingsModal = document.getElementById("reportSettingsModal");
const reportSettingsOverlay = document.getElementById("reportSettingsOverlay");

$(document).ready(function () {
    $("#report-settings-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        reportSettingsModal.style.display = "block";
        reportSettingsOverlay.style.display = "block";
        setTimeout(() => {
            reportSettingsModal.classList.add("show");
            reportSettingsOverlay.classList.add("show");
        }, 10);
    });

    closeLogsDisplay();
});

reportSettingsOverlay.addEventListener("click", closeLogsDisplay);

function closeLogsDisplay() {
    console.log("Inside closeLogsDisplay function");
    reportSettingsModal.classList.remove("show");
    reportSettingsOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        reportSettingsModal.style.display = "none";
        reportSettingsOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
