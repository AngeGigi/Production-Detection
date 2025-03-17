

document.addEventListener("DOMContentLoaded", function () {
    attachCardEventListener(); // Attach event listeners when the page loads
});


function attachCardEventListener() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.addEventListener("click", function () {
            const empID = card.getAttribute("data-name");
            const id = card.getAttribute("data-id");
            const fetchID = id || empID;
            // Update the hidden input field with the selected employee ID
            document.getElementById("dbid").value = fetchID;
            console.log(`Selected Employee ID: ${fetchID}`);
            console.log(`Fetching details for Card #${index + 1}, ID: ${fetchID}`);

            fetchAndPopulateEmployeeData(fetchID);
        });
    });
}

