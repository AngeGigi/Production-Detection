// document.addEventListener("DOMContentLoaded", function () {
//     // Check if the URL path is '/homepage'
//     if (window.location.pathname === '/homepage') {
//         document.querySelector(".card-view").classList.remove("d-none");
//         document.querySelector(".filter-cards").classList.remove("d-none");
//         document.querySelector(".search-area-cards").classList.remove("d-none");
//         document.querySelector(".card-btn-box-fill").classList.remove("d-none");
//         document.querySelector(".list-btn-box-grid").classList.remove("d-none");
//     } 
// });

// document.addEventListener("DOMContentLoaded", function () {
//     // Check if the URL path is '/analytics'
//     if (window.location.pathname === '/analytics') {
//         document.querySelector(".notif-box").classList.remove("d-none");
//     }
// });

document.addEventListener("DOMContentLoaded", function () {
    const cardViewButtonFill = document.querySelector('.card-btn-box-fill'); // Card view button
    const listViewButtonFill = document.querySelector('.list-btn-box-fill'); // List view button
    const cardViewButtonGrid = document.querySelector('.card-btn-box-grid'); // Card view button (grid)
    const listViewButtonGrid = document.querySelector('.list-btn-box-grid'); // List view button (grid)

    // Function to update the URL and reload the page
    function updateUrl(view) {
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('view', view); // Set 'view' to 'card' or 'list'
        location.href = currentUrl; // Update the URL and reload
    }

    // Event listeners to update the URL and reload the page
    cardViewButtonFill?.addEventListener('click', () => updateUrl('card'));
    listViewButtonFill?.addEventListener('click', () => updateUrl('list'));
    cardViewButtonGrid?.addEventListener('click', () => updateUrl('card'));
    listViewButtonGrid?.addEventListener('click', () => updateUrl('list'));
});


document.getElementById('notif-btn').addEventListener('click', function () {
    console.log('Button Clicked')
    const analyticsContainer = document.querySelector('.main-content-container');
    const notificationsSidebar = document.querySelector('.notif-box-container');
    
    // Toggle layout size for the analytics container and notification sidebar
    analyticsContainer.classList.toggle('col-12');
    analyticsContainer.classList.toggle('col-9');
    
    // Show or hide the notifications page
    notificationsSidebar.classList.toggle('w-0');
});
