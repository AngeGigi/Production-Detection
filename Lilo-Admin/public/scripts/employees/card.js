let groupedCardIds = []; // Declare outside so we can access it globally
let chunkSize = 10; // Default chunk size
let currentGroupIndex = 0; // Current displayed group index

document.addEventListener("DOMContentLoaded", function () {
    applyStatusColor();
    attachCardEventListener();
    groupCardIds(); // Group IDs after page load
    createGroupButtons(); // Dynamically create buttons after grouping cards
    updatePaginationButtons(); // Update pagination buttons visibility

    // Add event listener to update chunk size on dropdown change
    document
        .getElementById("cardLimit")
        .addEventListener("change", function () {
            chunkSize = parseInt(this.value); // Update chunk size based on selection
            groupedCardIds = []; // Clear previous groups

            const searchInput =
                document.getElementById("cardSearchInput").value; // Get current search input
            const sortBy = document.getElementById("cardSortCriteria").value; // Get current sort input

            if (searchInput) {
                // If there is an active search, redo the search with the new chunk size and sort
                searchCardEmployees(searchInput); // New function to handle both search and sort
            } else if (sortBy) {
                // If only sort is selected, just apply sorting
                sortCardView(); // This will sort based on the selected criteria
            } else {
                // No search or sort, regroup all employee IDs
                groupCardIds(); // Regroup the card IDs
                createGroupButtons(); // Recreate buttons based on the new groups
                showGroup(0); // Reset to show the first group
                currentGroupIndex = 0; // Reset current group index
                updatePaginationButtons(); // Update pagination buttons
            }
        });

    // Add click event listeners for pagination buttons
    document.getElementById("prevBtn").addEventListener("click", function () {
        if (currentGroupIndex > 0) {
            currentGroupIndex--; // Decrease the index
            showGroup(currentGroupIndex); // Show the new group
            updatePaginationButtons(); // Update button visibility
        }
    });

    document.getElementById("nextBtn").addEventListener("click", function () {
        if (currentGroupIndex < groupedCardIds.length - 1) {
            currentGroupIndex++; // Increase the index
            showGroup(currentGroupIndex); // Show the new group
            updatePaginationButtons(); // Update button visibility
        }
    });
});

// Group card IDs into arrays based on the selected chunk size
function groupCardIds() {
    const cards = document.querySelectorAll(".card");
    const allCardIds = [];

    cards.forEach((card) => {
        const cardId = card.getAttribute("data-id");
        if (cardId) {
            allCardIds.push(cardId);
        }
    });

    for (let i = 0; i < allCardIds.length; i += chunkSize) {
        const chunk = allCardIds.slice(i, i + chunkSize);
        groupedCardIds.push(chunk);
    }

    console.log("Grouped Card IDs:", groupedCardIds); // Logs all grouped arrays of card IDs
}

// Create buttons dynamically based on the number of groups
function createGroupButtons() {
    const buttonContainer = document.getElementById("button-container");
buttonContainer.innerHTML = ""; // Clear the container before adding buttons

// Create and append the "Previous" button
const prevButton = document.createElement("li");
prevButton.id = "prevBtn";  // Set the ID for "Previous" button
prevButton.classList.add("page-item");

const prevAnchor = document.createElement("a");
prevAnchor.classList.add("page-link");
prevAnchor.setAttribute("href", "#");
prevAnchor.textContent = "<";
// prevAnchor.innerHTML = '<i class="bi bi-arrow-left"></i>';


prevButton.appendChild(prevAnchor);
prevButton.addEventListener("click", function () {
    if (currentGroupIndex > 0) {
        currentGroupIndex--;  // Decrease the current group index
        showGroup(currentGroupIndex); // Call showGroup function
        updatePaginationButtons(); // Update button visibility
    }
});
buttonContainer.appendChild(prevButton);

// Create and append the page number buttons
groupedCardIds.forEach((group, index) => {
    const button = document.createElement("li");
    button.classList.add("showGroup");
    button.classList.add("page-item");

    const a = document.createElement("a");
    a.classList.add("page-link");
    a.setAttribute("href", "#");
    a.textContent = index + 1;  // Set the text of the anchor tag

    button.appendChild(a);
    button.setAttribute("data-page", index);
    button.setAttribute("data-array", index);

    button.addEventListener("click", function () {
        showGroup(index); // Call showGroup function with the appropriate index
        currentGroupIndex = index; // Update current group index
        updatePaginationButtons(); // Update button visibility
    });

    buttonContainer.appendChild(button);
});

// Create and append the "Next" button
const nextButton = document.createElement("li");
nextButton.id = "nextBtn";  // Set the ID for "Next" button
nextButton.classList.add("page-item");

const nextAnchor = document.createElement("a");
nextAnchor.classList.add("page-link");
nextAnchor.setAttribute("href", "#");
nextAnchor.textContent = ">";  // Set the text for "Next"

nextButton.appendChild(nextAnchor);
nextButton.addEventListener("click", function () {
    if (currentGroupIndex < groupedCardIds.length - 1) {
        currentGroupIndex++;  // Increase the current group index
        showGroup(currentGroupIndex); // Call showGroup function
        updatePaginationButtons(); // Update button visibility
    }
});
buttonContainer.appendChild(nextButton);



    // Show the first group by default (Group 1) after creating buttons
    if (groupedCardIds.length > 0) {
        showGroup(0); // Automatically show Group 1 (arrayIndex = 0) on page load
        currentGroupIndex = 0; // Set the initial group index
    }
}

// Display the group of cards based on the given index
function showGroup(arrayIndex) {
    const cards = document.querySelectorAll(".card");
    const groupToDisplay = groupedCardIds[arrayIndex]; // Get the group of card IDs to display

    if (groupToDisplay) {
        cards.forEach((card) => {
            const cardId = card.getAttribute("data-id");
            if (groupToDisplay.includes(cardId)) {
                card.style.display = "block"; // Show cards in the selected group
            } else {
                card.style.display = "none"; // Hide cards not in the selected group
            }
        });

        console.log(`Displaying cards in group ${arrayIndex}:`, groupToDisplay);
    } else {
        console.log(`No group found for array index ${arrayIndex}`);
    }
}

// Update pagination button visibility based on the current group index
function updatePaginationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Disable or enable the Previous button
    prevBtn.disabled = currentGroupIndex === 0;

    // Disable or enable the Next button
    nextBtn.disabled = currentGroupIndex >= groupedCardIds.length - 1;
}

// Initialize an array to store grouped employee IDs
let groupedEmployeeIds = [];

// Update searchCardEmployees function
function searchCardEmployees() {
    console.log("Clicked Search");
    const searchInput = document.getElementById("cardSearchInput").value;
    fetch(`/homepage/search?searchQuery=${encodeURIComponent(searchInput)}`)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("employees-container").innerHTML = data;
            applyStatusColor();
            attachCardEventListener();
            addPaginationProcess();
        })
        .catch((error) =>
            console.error("Error fetching filtered employees:", error)
        );
}

// Update sortCardView function
function sortCardView() {
    console.log("Clicked Sort");
    const sortBy = document.getElementById("cardSortCriteria").value;
    fetch(`/homepage/sort?sortBy=${encodeURIComponent(sortBy)}`)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("employees-container").innerHTML = data;
            applyStatusColor();
            attachCardEventListener();
            addPaginationProcess();
        })
        .catch((error) =>
            console.error("Error fetching sorted employees:", error)
        );
}

function addPaginationProcess() {
    let currentPage = 1; // Track the current page
    // Initialize an array to store IDs
    const employeeIds = [];
    const employeeCards = document.querySelectorAll(".card"); // Correct class for your cards

    employeeCards.forEach((card) => {
        const id = card.getAttribute("data-name"); // Use data-id for IDs
        console.log("Employee ID:", id); // Logging the ID
        employeeIds.push(id); // Store the ID in the array
    });

    // Group employee IDs based on selected cardLimit
    groupEmployeeIds(employeeIds);

    // Optionally log the entire array of grouped IDs
    console.log("Grouped Employee IDs:", groupedEmployeeIds);
    // Now dynamically create pagination buttons
    createPaginationButtons(groupedEmployeeIds.length);
    showPage(currentPage);

    // Function to create pagination buttons
function createPaginationButtons(totalPages) {
    const buttonContainer = document.getElementById("button-container");
    buttonContainer.innerHTML = ""; // Clear existing buttons, if any

    // Create and append the "Previous" button
    const prevButton = document.createElement("li");
    prevButton.id = "prevBtn";  // Set the ID for "Previous" button
    prevButton.classList.add("page-item");

    const prevAnchor = document.createElement("a");
    prevAnchor.classList.add("page-link");
    prevAnchor.setAttribute("href", "#");
    prevAnchor.textContent = "<";  // Set the text for "Previous"
    prevButton.appendChild(prevAnchor);
    prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;  // Decrease the current page
            console.log("Previous button clicked, show page", currentPage);
            showPage(currentPage);
            updateButtonStates(totalPages); // Update Prev and Next button states
        }
    });
    buttonContainer.appendChild(prevButton);

    // Create and append the page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("li");
        button.classList.add("page-item");

        const a = document.createElement("a");
        a.classList.add("page-link");
        a.setAttribute("href", "#");
        a.textContent = i;  // Set the text of the anchor tag

        // Append the anchor tag to the list item
        button.appendChild(a);
        button.setAttribute("data-page", i);

        // Add an event listener for the button to handle pagination
        button.addEventListener("click", function () {
            currentPage = i;
            console.log(`Button ${i} clicked, show page ${i}`);
            showPage(currentPage); // Display the specific page (cards with the correct emp IDs)
            updateButtonStates(totalPages); // Update Prev and Next button states
        });

        buttonContainer.appendChild(button);
    }

    // Create and append the "Next" button
    const nextButton = document.createElement("li");
    nextButton.id = "nextBtn";  // Set the ID for "Next" button
    nextButton.classList.add("page-item");

    const nextAnchor = document.createElement("a");
    nextAnchor.classList.add("page-link");
    nextAnchor.setAttribute("href", "#");
    nextAnchor.textContent = ">";  // Set the text for "Next"
    nextButton.appendChild(nextAnchor);
    nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;  // Increase the current page
            console.log("Next button clicked, show page", currentPage);
            showPage(currentPage);
            updateButtonStates(totalPages); // Update Prev and Next button states
        }
    });
    buttonContainer.appendChild(nextButton);

    // Initial state update for the buttons
    updateButtonStates(totalPages);
}


    // Function to disable/enable Prev and Next buttons
    function updateButtonStates(totalPages) {
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        // Disable Prev button if we're on the first page
        prevBtn.disabled = currentPage === 1;

        // Disable Next button if we're on the last page
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Function to group employee IDs based on selected card limit
function groupEmployeeIds(employeeIds) {
    groupedEmployeeIds = []; // Reset grouped employee IDs
    for (let i = 0; i < employeeIds.length; i += chunkSize) {
        const chunk = employeeIds.slice(i, i + chunkSize);
        groupedEmployeeIds.push(chunk);
    }
}

function showPage(pageNumber) {
    const selectedGroup = groupedEmployeeIds[pageNumber - 1]; // Get the correct group for the page number
    console.log(`Displaying page ${pageNumber}`, selectedGroup);
    const employeeCards = document.querySelectorAll(".card"); // Correct class for your cards

    employeeCards.forEach((card) => {
        const cardId = card.getAttribute("data-name"); // Get employee ID from the card

        if (selectedGroup.includes(cardId)) {
            card.style.display = "block"; // Show the card if the ID is in the selected group
        } else {
            card.style.display = "none"; // Hide the card if the ID is not in the selected group
        }
    });
}

function clearSearch() {
    document.getElementById("cardSearchInput").value = "";
    searchCardEmployees(); // Trigger search to reset
}

document.addEventListener("DOMContentLoaded", function () {
    applyStatusColor();
    attachCardEventListener(); // Attach event listeners when the page loads
});

function applyStatusColor() {
    const empIcons = document.querySelectorAll(".emp-icon");
    empIcons.forEach((icon) => {
        const statusInput = icon.querySelector(".emp-stat-value");
        const badge = icon.querySelector(".emp-stat");
        const statusValue = statusInput.value;

        if (statusValue === "Active") {
            badge.style.backgroundColor = "green";
        } else if (statusValue === "Pending") {
            badge.style.backgroundColor = "orange";
        } else if (statusValue === "Inactive") {
            badge.style.backgroundColor = "red";
        } else {
            badge.style.backgroundColor = "gray"; // Default for unknown status
        }
    });
}

// Call the function after the DOM is loaded
document.addEventListener("DOMContentLoaded", applyStatusColor);


function attachCardEventListener() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            const empID = card.getAttribute("data-name");
            const id = card.getAttribute("data-id");
            const fetchID = id || empID;
            fetchAndPopulateEmployeeData(fetchID);
        });
    });
}
