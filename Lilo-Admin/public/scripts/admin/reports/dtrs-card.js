// Function to display the current date
function displayCurrentDate() {
    const dateElement = document.getElementById("current-date");
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    dateElement.textContent = today.toLocaleDateString(undefined, options);
}

displayCurrentDate();
changeCardColors();

// Copy address function
function copyAddress(address) {
    navigator.clipboard
        .writeText(address)
        .then(() => {
            alert("Address copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
        });
}

let modalMap;

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to search card records with debounce
const searchCardRecords = debounce(function () {
    const searchInput = document.getElementById("cardSearchInput").value;
    fetch(`/reports/dtrs/search?searchQuery=${encodeURIComponent(searchInput)}`)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("records-container").innerHTML = data;
            updateMaps();
            changeCardColors();
            DTRSaddPaginationProcess();
        })
        .catch((error) =>
            console.error("Error fetching filtered records:", error)
        );
}, 300); // Adjust debounce delay as necessary

// Function to sort card view with debounce
const sortCardView = debounce(function () {
    const sortBy = document.getElementById("cardSortCriteria").value;
    fetch(`/reports/dtrs/sort?sortBy=${encodeURIComponent(sortBy)}`)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("records-container").innerHTML = data;
            updateMaps(); // Ensure maps are updated after sorting
            changeCardColors();
            DTRSaddPaginationProcess();
        })
        .catch((error) =>
            console.error("Error fetching sorted records:", error)
        );
}, 300); // Adjust debounce delay as necessary

// Clear search input
function clearSearch() {
    document.getElementById("cardSearchInput").value = "";
    searchCardRecords("");
}

// Lazy load maps
function lazyLoadMaps() {
    const maps = document.querySelectorAll(".map-small");
    maps.forEach((mapElement) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const lat = parseFloat(mapElement.dataset.lat);
                    const long = parseFloat(mapElement.dataset.long);
                    initMap(mapElement, lat, long);
                    observer.unobserve(mapElement); // Stop observing after loading
                }
            });
        });
        observer.observe(mapElement); // Start observing the map element
    });
}

// Function to update maps
function updateMaps() {
    lazyLoadMaps(); // Call lazy loading
    attachMapClickEvents();
}

// Attach click events to small maps for showing in modal
function attachMapClickEvents() {
    document.querySelectorAll(".map-small").forEach((mapElement) => {
        mapElement.addEventListener("click", function () {
            const lat = parseFloat(this.dataset.lat);
            const long = parseFloat(this.dataset.long);
            const address = this.dataset.address || "Unknown location";
            showMapPopup2(lat, long, "Location: " + address);
        });
    });
}

// Map initialization function
function initMap(mapElement, latitude, longitude) {
    const map = L.map(mapElement, {
        dragging: false, // Disable dragging
        scrollWheelZoom: false, // Disable zoom on scroll
        doubleClickZoom: false, // Disable double click zoom
        touchZoom: false, // Disable touch zoom (for mobile devices)
        zoomControl: false, // Optionally disable zoom control buttons
    }).setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap",
    }).addTo(map);

    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Location: Unknown location");
    map.invalidateSize();
    return map;
}

// Function to show a map in a modal
function showMapPopup2(lat, lng, content) {
    const dtrscardmodal = document.getElementById("mapModal");
    const modalMapElement = document.getElementById("modalMap");

    if (modalMap) {
        modalMap.off();
        modalMap.remove();
    }

    modalMap = L.map(modalMapElement, {
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true,
    }).setView([lat, lng], 19);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap",
    }).addTo(modalMap);

    L.marker([lat, lng]).addTo(modalMap).bindPopup(content);

    dtrscardmodal.style.display = "flex";

    setTimeout(() => {
        dtrscardmodal.classList.add("active");
        modalMap.invalidateSize();
    }, 100);
}

// Initialize small maps and attach click events
document.addEventListener("DOMContentLoaded", function () {
    updateMaps();

    // Attach click event for image modal
    const dtrscardimage = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.getElementById("modalClose");

    // Open the modal when an image is clicked
    document
        .getElementById("records-container")
        .addEventListener("click", function (event) {
            if (event.target.tagName === "IMG") {
                dtrscardimage.style.display = "flex"; // Ensure modal is displayed
                setTimeout(() => {
                    dtrscardimage.classList.add("show"); // Show the modal
                    modalImg.src = event.target.src; // Set the clicked image's source
                }, 100);
            }
        });

    // Close the modal
    closeBtn.addEventListener("click", function () {
        dtrscardimage.classList.remove("show"); // Hide the modal
        setTimeout(() => {
            dtrscardimage.style.display = "none";
        }, 300); // Wait for transition to complete
    });

    // Close the modal when clicking outside the modal content
    dtrscardimage.addEventListener("click", function (event) {
        if (event.target === dtrscardimage) {
            dtrscardimage.classList.remove("show"); // Hide the modal
            setTimeout(() => {
                dtrscardimage.style.display = "none";
            }, 300); // Wait for transition to complete
        }
    });

    // Close the modals when clicking outside
    window.onclick = function (event) {
        const dtrscardmodal = document.getElementById("mapModal");
        if (event.target === dtrscardmodal) {
            dtrscardmodal.classList.remove("active"); // Remove the class for hiding
            setTimeout(() => {
                dtrscardmodal.style.display = "none"; // Hide the modal after transition
            }, 300); // Wait for transition to complete
        }
    };
});

function changeCardColors() {
    const activityTimeElements = document.querySelectorAll(
        ".record-activity-time"
    );
    const recordTimeElements = document.querySelectorAll(".record-time");
    const addressElements = document.querySelectorAll(".this-address"); // Select the address containers
    const copyAddElements = document.querySelectorAll(".copy-add"); // Select the copy address containers

    // Function to set background color based on activity for activity time elements
    function setBackgroundColor(element, activity) {
        let bgColor;
        if (activity === "in") {
            bgColor = "#433554";
        } else if (activity === "out") {
            bgColor = "#4cbdd7";
        } else {
            bgColor = ""; // Default or no background
        }
        element.style.backgroundColor = bgColor;
    }

    // Function to set text color based on activity for record time elements
    function setTextColor(element, activity) {
        let textColor;
        if (activity === "in") {
            textColor = "#433554"; // Example color for 'in'
        } else if (activity === "out") {
            textColor = "#4cbdd7"; // Example color for 'out'
        } else {
            textColor = "#000"; // Default text color
        }
        element.style.color = textColor;
    }

    // Function to set icon color based on activity
    function setIconColor(iconElement, activity) {
        let iconColor;
        if (activity === "in") {
            iconColor = "#433554"; // Example color for 'in'
        } else if (activity === "out") {
            iconColor = "#4cbdd7"; // Example color for 'out'
        } else {
            iconColor = ""; // Default or no color
        }
        iconElement.style.color = iconColor; // Apply color to the icon
    }

    // Apply background colors for activity time
    activityTimeElements.forEach((element) => {
        const activity = element.getAttribute("data-activity");
        setBackgroundColor(element, activity);
    });

    // Apply text colors for record time
    recordTimeElements.forEach((element) => {
        const activity = element.getAttribute("data-activity");
        setTextColor(element, activity);
    });

    // Apply icon colors for addresses
    addressElements.forEach((address) => {
        const activity = address.getAttribute("data-activity"); // Get activity directly from this-address
        const icon = address.querySelector("i"); // Select the icon within this-address
        setIconColor(icon, activity); // Set icon color based on activity
    });

    // Apply icon colors for copy address
    copyAddElements.forEach((copyAdd) => {
        const activity = copyAdd.getAttribute("data-activity"); // Get activity directly from copy-add
        const icon = copyAdd.querySelector("i"); // Select the icon within copy-add
        setIconColor(icon, activity); // Set icon color based on activity
    });
}


let groupedRecordIds = []; // Store grouped record IDs
let recordChunkSize = 10; // Default chunk size for record grouping
let currentRecordGroupIndex = 0; // Track the current displayed group

document.addEventListener("DOMContentLoaded", function () {
    groupRecordIds(); // Group records after page load
    createRecordGroupButtons(); // Create buttons for pagination
    updateRecordPaginationButtons(); // Update button visibility

    // Update chunk size on dropdown change
    document
        .getElementById("recordLimit")
        .addEventListener("change", function () {
            recordChunkSize = parseInt(this.value); // Update chunk size
            groupedRecordIds = []; // Clear existing groups
            groupRecordIds(); // Regroup with new chunk size
            createRecordGroupButtons(); // Recreate pagination buttons
            showRecordGroup(0); // Show the first group by default
            currentRecordGroupIndex = 0; // Reset index
            updateRecordPaginationButtons(); // Update pagination buttons
        });

    // Pagination button listeners
    document.getElementById("prevRecordBtn").addEventListener("click", function () {
        if (currentRecordGroupIndex > 0) {
            currentRecordGroupIndex--;
            showRecordGroup(currentRecordGroupIndex);
            updateRecordPaginationButtons();
        }
    });

    document.getElementById("nextRecordBtn").addEventListener("click", function () {
        if (currentRecordGroupIndex < groupedRecordIds.length - 1) {
            currentRecordGroupIndex++;
            showRecordGroup(currentRecordGroupIndex);
            updateRecordPaginationButtons();
        }
    });
});

// Group record IDs based on chunk size
function groupRecordIds() {
    const records = document.querySelectorAll(".record-card"); // Assuming the class for record cards
    const allRecordIds = [];

    records.forEach((record) => {
        const recordId = record.getAttribute("data-id");
        if (recordId) {
            allRecordIds.push(recordId);
        }
    });

    for (let i = 0; i < allRecordIds.length; i += recordChunkSize) {
        const chunk = allRecordIds.slice(i, i + recordChunkSize);
        groupedRecordIds.push(chunk);
    }

    console.log("Grouped Record IDs:", groupedRecordIds);
}

// Create buttons for navigating record groups
function createRecordGroupButtons() {
    const buttonContainer = document.getElementById("record-button-container");
    buttonContainer.innerHTML = ""; // Clear previous buttons

    groupedRecordIds.forEach((group, index) => {
        const button = document.createElement("button");
        button.classList.add("showRecordGroup");
        button.setAttribute("data-array", index);
        button.innerText = `${index + 1}`;

        button.addEventListener("click", function () {
            showRecordGroup(index);
            currentRecordGroupIndex = index;
            updateRecordPaginationButtons();
        });

        buttonContainer.appendChild(button);
    });

    if (groupedRecordIds.length > 0) {
        showRecordGroup(0); // Show first group
        currentRecordGroupIndex = 0;
    }
}

// Show a specific group of record cards
function showRecordGroup(arrayIndex) {
    const records = document.querySelectorAll(".record-card");
    const groupToDisplay = groupedRecordIds[arrayIndex];

    if (groupToDisplay) {
        records.forEach((record) => {
            const recordId = record.getAttribute("data-id");
            if (groupToDisplay.includes(recordId)) {
                record.style.display = "block";
            } else {
                record.style.display = "none";
            }
        });

        console.log(`Displaying records in group ${arrayIndex}:`, groupToDisplay);
    } else {
        console.log(`No group found for array index ${arrayIndex}`);
    }
}

// Update pagination button states
function updateRecordPaginationButtons() {
    const prevBtn = document.getElementById("prevRecordBtn");
    const nextBtn = document.getElementById("nextRecordBtn");

    prevBtn.disabled = currentRecordGroupIndex === 0;
    nextBtn.disabled = currentRecordGroupIndex >= groupedRecordIds.length - 1;
}



// Initialize an array to store grouped employee IDs
let DTRSgroupedEmployeeIds = [];

function DTRSaddPaginationProcess() {
    let currentPage = 1; // Track the current page
    // Initialize an array to store IDs
    const employeeIds = [];
    const employeeCards = document.querySelectorAll(".dtrs-card"); // Correct class for your cards

    employeeCards.forEach((card) => {
        const id = card.getAttribute("data-id"); // Use data-id for IDs
        console.log("Employee ID:", id); // Logging the ID
        employeeIds.push(id); // Store the ID in the array
    });

    // Group employee IDs based on selected cardLimit
    DTRSgroupEmployeeIds(employeeIds);

    // Optionally log the entire array of grouped IDs
    console.log("Grouped Employee IDs:", DTRSgroupedEmployeeIds);
    // Now dynamically create pagination buttons
    DTRScreatePaginationButtons(DTRSgroupedEmployeeIds.length);
    DTRSshowPage(currentPage);

    // Function to create pagination buttons
    function DTRScreatePaginationButtons(totalPages) {
        const buttonContainer = document.getElementById("dtrs-button-container");
        buttonContainer.innerHTML = ""; // Clear existing buttons, if any

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.setAttribute("data-page", i);

            // Add an event listener for the button to handle pagination
            button.addEventListener("click", function () {
                currentPage = i;
                console.log(`Button ${i} clicked, show page ${i}`);
                DTRSshowPage(currentPage);
            });

            buttonContainer.appendChild(button);
        }

        // Add functionality to "Prev" and "Next" buttons
        const prevBtn = document.getElementById("dtrsprevBtn");
        const nextBtn = document.getElementById("dtrsnextBtn");

        prevBtn.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                console.log("Previous button clicked, show page", currentPage);
                DTRSshowPage(currentPage);
                DTRSupdateButtonStates(totalPages); // Update Prev and Next button states
            }
        });

        nextBtn.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                console.log("Next button clicked, show page", currentPage);
                DTRSshowPage(currentPage);
                DTRSupdateButtonStates(totalPages); // Update Prev and Next button states
            }
        });

        // Initial state update for the buttons
        DTRSupdateButtonStates(totalPages);
    }

    // Function to disable/enable Prev and Next buttons
    function DTRSupdateButtonStates(totalPages) {
        const prevBtn = document.getElementById("dtrsprevBtn");
        const nextBtn = document.getElementById("dtrsnextBtn");

        // Disable Prev button if we're on the first page
        prevBtn.disabled = currentPage === 1;

        // Disable Next button if we're on the last page
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Function to group employee IDs based on selected card limit
function DTRSgroupEmployeeIds(employeeIds) {
    DTRSgroupedEmployeeIds = []; // Reset grouped employee IDs
    for (let i = 0; i < employeeIds.length; i += DTRSchunkSize) {
        const chunk = employeeIds.slice(i, i + DTRSchunkSize);
        DTRSgroupedEmployeeIds.push(chunk);
    }
}

function DTRSshowPage(pageNumber) {
    const selectedGroup = DTRSgroupedEmployeeIds[pageNumber - 1]; // Get the correct group for the page number
    console.log(`Displaying page ${pageNumber}`, selectedGroup);
    const employeeCards = document.querySelectorAll(".dtrs-card"); // Correct class for your cards

    employeeCards.forEach((card) => {
        const cardId = card.getAttribute("data-id"); // Get employee ID from the card

        if (selectedGroup.includes(cardId)) {
            card.style.display = "block"; // Show the card if the ID is in the selected group
        } else {
            card.style.display = "none"; // Hide the card if the ID is not in the selected group
        }
    });
}