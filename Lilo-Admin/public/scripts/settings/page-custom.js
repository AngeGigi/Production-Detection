const pageCustomModal = document.getElementById("pageCustomModal");
const pageCustomOverlay = document.getElementById("pageCustomOverlay");

$(document).ready(function () {
    $("#page-custom-btn").on("click", function (e) {
        e.preventDefault(); // Prevent the default action
        // Show the modal
        pageCustomModal.style.display = "block";
        pageCustomOverlay.style.display = "block";
        setTimeout(() => {
            pageCustomModal.classList.add("show");
            pageCustomOverlay.classList.add("show");
        }, 10);
    });

    closepageCustomModal();
});

pageCustomOverlay.addEventListener("click", closepageCustomModal);

function closepageCustomModal() {
    console.log("Inside closepageCustomModal function");
    pageCustomModal.classList.remove("show");
    pageCustomOverlay.classList.remove("show");

    // Ensure modal is properly hidden after the animation
    setTimeout(() => {
        pageCustomModal.style.display = "none";
        pageCustomOverlay.style.display = "none";
        console.log("Modal closed");
    }, 300);
}
