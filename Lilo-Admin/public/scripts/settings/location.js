$(document).ready(async function () {
    // Initialize the map
    const map = L.map("map", {
        center: [14.64741996027909, 121.02797333282798],
        zoom: 19, // Initial zoom level
        maxZoom: 19, // Max zoom level
        minZoom: 10, // Min zoom level
        inertia: true, // For smooth map panning
        maxBoundsViscosity: 1.0, // Constrain map to avoid empty gray areas
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        tileSize: 256,
        tilePadding: 0,
    }).addTo(map);

    $(window).on("resize", function () {
        map.invalidateSize();
    });

    // Create a single marker
    let marker = L.marker([14.64741996027909, 121.02797333282798], {
        draggable: true,
    }).addTo(map);

    // Keep the marker centered after dragging
    marker.on("dragend", function () {
        const position = marker.getLatLng();
        map.setView(position);
        updateLatLongInputs(position.lat, position.lng); // Update input fields on drag end
    });

    const nameInput = $("#locationName");
    const latInput = $("#locationLat");
    const longInput = $("#locationLong");
    const nameError = $("#nameError");
    const latError = $("#latError");
    const longError = $("#longError");

    // Function to validate latitude and longitude
    function isValidLatLng(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    // Function to check if the location name already exists
    function locationExists(name) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const locationName = $(this).find("td:eq(0)").text().trim();
            if (locationName.toLowerCase() === name.toLowerCase()) {
                exists = true;
                return false; // Stop loop if a match is found
            }
        });
        return exists;
    }

    // Function to check if the same lat/long already exists
    function isLocationExists(lat, long) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const existingLat = parseFloat($(this).find("td:eq(1)").text());
            const existingLong = parseFloat($(this).find("td:eq(2)").text());

            if (existingLat === lat && existingLong === long) {
                exists = true;
                return false; // Stop loop if a match is found
            }
        });
        return exists;
    }

    // Event listener for location name input
    nameInput.on("input", function () {
        const name = nameInput.val().trim();
        if (name.length > 0 && locationExists(name)) {
            nameError.text(
                "Location name already exists. Please choose another name."
            );
        } else {
            nameError.text("");
        }
    });

    // Event listeners for latitude and longitude inputs
    latInput.on("input", function () {
        const lat = parseFloat(latInput.val());
        const lng = parseFloat(longInput.val());

        if (!isValidLatLng(lat, lng)) {
            latError.text("Latitude must be between -90 and 90.");
        } else if (isLocationExists(lat, lng)) {
            latError.text(
                "This latitude and longitude combination already exists."
            );
        } else {
            latError.text("");
        }
    });

    longInput.on("input", function () {
        const lat = parseFloat(latInput.val());
        const lng = parseFloat(longInput.val());

        if (!isValidLatLng(lat, lng)) {
            longError.text("Longitude must be between -180 and 180.");
        } else if (isLocationExists(lat, lng)) {
            longError.text(
                "This latitude and longitude combination already exists."
            );
        } else {
            longError.text("");
        }
    });

    // // Event listeners for latitude and longitude inputs
    // latInput.on("input", function () {
    //     const lat = parseFloat(latInput.val());
    //     const lng = parseFloat(longInput.val());

    //     // Check if input is empty and clear error messages if true
    //     if (latInput.val() === "" || longInput.val() === "") {
    //         latError.text("");
    //         longError.text("");
    //         return; // Exit the function early if the inputs are empty
    //     }

    //     if (!isValidLatLng(lat, lng)) {
    //         latError.text("Latitude must be between -90 and 90.");
    //     } else if (isLocationExists(lat, lng)) {
    //         latError.text("This latitude and longitude combination already exists.");
    //     } else {
    //         latError.text("");
    //     }
    // });

    // longInput.on("input", function () {
    //     const lat = parseFloat(latInput.val());
    //     const lng = parseFloat(longInput.val());

    //     // Check if input is empty and clear error messages if true
    //     if (latInput.val() === "" || longInput.val() === "") {
    //         latError.text("");
    //         longError.text("");
    //         return; // Exit the function early if the inputs are empty
    //     }

    //     if (!isValidLatLng(lat, lng)) {
    //         longError.text("Longitude must be between -180 and 180.");
    //     } else if (isLocationExists(lat, lng)) {
    //         longError.text("This latitude and longitude combination already exists.");
    //     } else {
    //         longError.text("");
    //     }
    // });

    // Function to validate latitude and longitude
    function isValidLatLng(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    //function to check if the name already exists, new code
    function locationExists(name) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const locationName = $(this).find("td:eq(0)").text().trim();
            if (locationName.toLowerCase() === name.toLowerCase()) {
                exists = true;
                return false;
            }
        });
        return exists;
    }
    const locationsTable = initializeDataTable();

    //check if the same longlat already exists, new code
    function isLocationExists(lat, long) {
        let exists = false;
        // Loop through the DataTable rows to check if the lat and long already exist
        $("#locationsTable tbody tr").each(function () {
            const existingLat = parseFloat($(this).find("td:eq(1)").text());
            const existingLong = parseFloat($(this).find("td:eq(2)").text());

            if (existingLat === lat && existingLong === long) {
                exists = true;
                return false; // Break the loop if a match is found
            }
        });
        return exists;
    }

    // Function to fetch and populate the table
    async function fetchAndPopulateTable() {
        try {
            const response = await fetch("/settings", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch locations.");
            }

            const data = await response.json(); // JSON response
            populateTable(data.locations);
        } catch (error) {
            console.error("Error fetching locations:", error);
            alert("Failed to load locations. Please try again later.");
        }
    }

    // Function to populate DataTable
    function populateTable(locations) {
        locationsTable.clear(); // Clear any existing data

        locations.forEach((location) => {
            const editButton = `<button class="btn btn-primary edit-location" data-id="${location.id}" title="Edit Location">
                                <i class="bi bi-pencil-square"></i></button>`;
            const deleteButton = `<button class="btn btn-danger delete-location" data-id="${location.id}" title="Delete Location">
                                <i class="bi bi-trash-fill"></i></button>`;


            locationsTable.row.add([
                location.name,
                location.lat,
                location.long,
                `${editButton} ${deleteButton}`,
            ]);
        });

        locationsTable.draw(); // Redraw the table with updated data
    }

    // Fetch and populate the table on page load
    await fetchAndPopulateTable();

    // Function to validate latitude and longitude
    function isValidLatLng(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
    const updateName = $("#updateName");
    const updateInput = $("#updateLat");
    const updateLat = $("#updateLong");
    const updateNameError = $("#updateNameError");
    const updateLatError = $("#updateLatError");
    const updateLongError = $("#updateLongError");

    // Function to validate latitude and longitude
    function isValidLatLng(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    // Function to check if the location name already exists
    function locationExists(name) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const updateName = $(this).find("td:eq(0)").text().trim();
            if (updateName.toLowerCase() === name.toLowerCase()) {
                exists = true;
                return false; // Stop loop if a match is found
            }
        });
        return exists;
    }

    // Function to check if the same lat/long already exists
    function isLocationExists(lat, long) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const existingLat = parseFloat($(this).find("td:eq(1)").text());
            const existingLong = parseFloat($(this).find("td:eq(2)").text());

            if (existingLat === lat && existingLong === long) {
                exists = true;
                return false; // Stop loop if a match is found
            }
        });
        return exists;
    }

    // Event listener for location name input
    updateName.on("input", function () {
        const name = updateName.val().trim();
        if (name.length > 0 && locationExists(name)) {
            updateNameError.text(
                "Location name already exists. Please choose another name."
            );
        } else {
            updateNameError.text("");
        }
    });

    // Event listeners for latitude and longitude inputs
    updateInput.on("input", function () {
        const lat = parseFloat(updateInput.val());
        const lng = parseFloat(updateLat.val());

        if (!isValidLatLng(lat, lng)) {
            updateLatError.text("Latitude must be between -90 and 90.");
        } else if (isLocationExists(lat, lng)) {
            updateLatError.text(
                "This latitude and longitude combination already exists."
            );
        } else {
            updateLatError.text("");
        }
    });

    updateLat.on("input", function () {
        const lat = parseFloat(updateInput.val());
        const lng = parseFloat(updateLat.val());

        if (!isValidLatLng(lat, lng)) {
            updateLongError.text("Longitude must be between -180 and 180.");
        } else if (isLocationExists(lat, lng)) {
            updateLongError.text(
                "This latitude and longitude combination already exists."
            );
        } else {
            updateLongError.text("");
        }
    });

    // Function to validate latitude and longitude
    function isValidLatLng(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    //function to check if the name already exists, new code
    function locationExists(name) {
        let exists = false;
        $("#locationsTable tbody tr").each(function () {
            const updateName = $(this).find("td:eq(0)").text().trim();
            if (updateName.toLowerCase() === name.toLowerCase()) {
                exists = true;
                return false;
            }
        });
        return exists;
    }

    //check if the same longlat already exists, new code
    function isLocationExists(lat, long) {
        let exists = false;
        // Loop through the DataTable rows to check if the lat and long already exist
        $("#locationsTable tbody tr").each(function () {
            const existingLat = parseFloat($(this).find("td:eq(1)").text());
            const existingLong = parseFloat($(this).find("td:eq(2)").text());

            if (existingLat === lat && existingLong === long) {
                exists = true;
                return false; // Break the loop if a match is found
            }
        });
        return exists;
    }
    // Function to update latitude and longitude input fields
    function updateLatLongInputs(lat, lng) {
        $("#locationLat").val(lat.toFixed(6));
        $("#locationLong").val(lng.toFixed(6));
    }

    // Function to initialize DataTable
    function initializeDataTable() {
        if ($.fn.dataTable.isDataTable("#locationsTable")) {
            $("#locationsTable").DataTable().clear().destroy();
        }

        return $("#locationsTable").DataTable({
            deferRender: true,
            autoWidth: false, // Disable automatic width calculation
            responsive: true, // Enable responsive mode
            order: [[3, "desc"]],
            pageLength: 5,
            lengthMenu: [5, 10, 25],
            language: {
                lengthMenu: "_MENU_",
                zeroRecords: "No matching records found",
                info: "Showing page _PAGE_ of _PAGES_",
                infoEmpty: "No locations available",
                infoFiltered: "",
                search: " ", // Empty string to remove default search label
                searchPlaceholder: "Search Location", // Your custom placeholder
                paginate: {
                    previous: "<<",
                    next: ">>",
                },
            },
        });
    }

    $("#locationsTable_length .form-select").css("width", "70px");

    const locationModal = document.getElementById("locationModal");

    $("#location-track-btn").on("click", function (e) {
        e.preventDefault();
        locationModal.style.display = "block";
        locationOverlay.style.display = "block";
        setTimeout(() => {
            locationModal.classList.add("show");
            locationOverlay.classList.add("show");
            map.invalidateSize();
        }, 10);
    });

    document
        .getElementById("locationForm")
        .addEventListener("submit", async (event) => {
            event.preventDefault();
            const nameInput = document.getElementById("locationName").value;
            const latInput = parseFloat(
                document.getElementById("locationLat").value
            );
            const longInput = parseFloat(
                document.getElementById("locationLong").value
            );

            // Function to validate latitude and longitude
            function isValidLatLng(lat, lng) {
                return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
            }

            try {
                const response = await fetch("/settings/location-settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: nameInput,
                        lat: latInput,
                        long: longInput,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    addLocationToTable(data.newLocation);
                    alert(data.message);

                    L.marker([latInput, longInput]).addTo(map);
                    map.setView([latInput, longInput]);

                    document.getElementById("locationName").value = "";
                    document.getElementById("locationLat").value = "";
                    document.getElementById("locationLong").value = "";
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("An error occurred while submitting the form");
            }
        });

    function addLocationToTable(location) {
        // Ensure the icon buttons are consistent
        const editButton = `<button class="btn btn-primary edit-location" data-id="${location.id}" title="Edit Location">
                            <i class="bi bi-pencil-square"></i></button>`;
        const deleteButton = `<button class="btn btn-danger delete-location" data-id="${location.id}" title="Delete Location">
                                <i class="bi bi-trash-fill"></i></button>`;


        locationsTable.row
            .add([
                location.name,
                location.lat,
                location.long,
                `${editButton} ${deleteButton}`,
            ])
            .draw();
    }

    $("#updateLocationForm").on("submit", async function (event) {
        event.preventDefault();
        const locationId = $(this).data("id");
        const name = $("#updateName").val();
        const lat = $("#updateLat").val();
        const long = $("#updateLong").val();

        // Validate latitude and longitude
        if (!isValidLatLng(lat, long)) {
            alert(
                "Please enter valid latitude (-90 to 90) and longitude (-180 to 180)."
            );
            return;
        }

        try {
            const response = await fetch(
                `/settings/location-settings/${locationId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, lat, long }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                alert(data.message);

                const row = locationsTable.row(
                    $("#updateLocationForm").data("row")
                );
                row.data([
                    name,
                    lat,
                    long,
                    `<button class="btn btn-primary edit-location" data-id="${locationId}" title="Edit Location">
                            <i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-danger delete-location" data-id="${locationId}" title="Delete Location">
                                <i class="bi bi-trash-fill"></i></button>`,
                ]).draw();

                closeUpdateForm();
                $("#locationForm").toggleClass("d-none");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error updating location:", error);
            alert("An error occurred while updating the location");
        }
    });

    $(document).on("click", ".edit-location", function () {
        const locationId = $(this).data("id");
        const row = $(this).closest("tr");
        const name = row.find("td:eq(0)").text();
        const lat = parseFloat(row.find("td:eq(1)").text());
        const long = parseFloat(row.find("td:eq(2)").text());

        // Hide the Add Location form and show the Update Location form
        $("#locationForm").addClass("d-none");
        $("#updateLocationForm").removeClass("d-none");
        $("#locationFormTitle").addClass("d-none");
        $("#updateLocationFormTitle").removeClass("d-none");

        // Fill the update form with existing data
        $("#updateName").val(name);
        $("#updateLat").val(lat);
        $("#updateLong").val(long);

        // Store row data for future updates
        $("#updateLocationForm").data("id", locationId).data("row", row);

        // Display the marker on the map with the selected coordinates
        displayMarkerOnUpdate(lat, long);
    });

    $(document).on("click", ".delete-location", async function () {
        const locationId = $(this).data("id");
        const row = $(this).closest("tr");

        if (confirm("Are you sure you want to delete this location?")) {
            try {
                const response = await fetch(
                    `/settings/location-settings/${locationId}`,
                    {
                        method: "DELETE",
                    }
                );

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    locationsTable.row(row).remove().draw();
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Error deleting location:", error);
                alert("An error occurred while deleting the location");
            }
        }
    });

    map.on("click", function (e) {
        const lat = e.latlng.lat;
        const long = e.latlng.lng;

        marker.setLatLng([lat, long]);
        map.setView([lat, long]);

        if ($("#updateLocationForm").is(":visible")) {
            $("#updateLat").val(lat.toFixed(6));
            $("#updateLong").val(long.toFixed(6));
        } else {
            updateLatLongInputs(lat, long); // Update inputs on map click
        }
    });

    function displayMarkerOnUpdate(lat, long) {
        marker.setLatLng([lat, long]);
        map.setView([lat, long]);
    }

    function closeUpdateForm() {
        $("#updateLocationForm").addClass("d-none");
        $("#updateLocationFormTitle").addClass("d-none");
        $("#locationFormTitle").removeClass("d-none");
        $("#updateLocationForm").trigger("reset");
    }

    function closeLocModal() {
        locationModal.classList.remove("show");
        locationOverlay.classList.remove("show");

        setTimeout(() => {
            locationModal.style.display = "none";
            locationOverlay.style.display = "none";

            document.getElementById("locationName").value = "";
            document.getElementById("locationLat").value = "";
            document.getElementById("locationLong").value = "";
            $("#updateLocationForm").trigger("reset");
        }, 300);
    }

    locationOverlay.addEventListener("click", closeLocModal);

    // Update marker position when inputs change
    $("#locationLat, #locationLong").on("input", function () {
        const lat = parseFloat($("#locationLat").val());
        const long = parseFloat($("#locationLong").val());

        if (isValidLatLng(lat, long)) {
            marker.setLatLng([lat, long]);
            map.setView([lat, long]);
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    document
        .getElementById("CancelupdateLocationButton")
        .addEventListener("click", function (event) {
            event.preventDefault(); // Prevent form submission

            // Hide the update form and show the create form
            document
                .getElementById("updateLocationForm")
                .classList.add("d-none");
            document.getElementById("locationForm").classList.remove("d-none");
            document
                .getElementById("updateLocationFormTitle")
                .classList.add("d-none");
            document
                .getElementById("locationFormTitle")
                .classList.remove("d-none");
        });
});
