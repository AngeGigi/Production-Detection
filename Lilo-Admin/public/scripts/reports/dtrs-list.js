$(document).ready(function () {
    $('#loadingModal').show();
    $('#contentBody').hide();

    setTimeout(function() {
        $('#loadingModal').fadeOut(function() {
            $('#contentBody').fadeIn();
        });
    }, 2000);

    initializeMapsOnCurrentPage();

    // Initialize DataTable
    const table = $("#recordsTable").DataTable({
        deferRender: true,
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        columnDefs: [{ orderable: false, targets: [7, 9] }],
        language: {
            lengthMenu: "Show _MENU_",
            zeroRecords: "No matching records found",
            info: "Showing page _PAGE_ of _PAGES_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
            search: "",
            searchPlaceholder: "Search Records",
            paginate: {
                previous: "<<",
                next: ">>",
            },
        },
    });

    // Move the search box to the header
    $("#recordsTable_filter").appendTo(".dtrs-search-area-list");
    $("#recordsTable_filter label").addClass("w-100");
    $("#recordsTable thead").appendTo("#recordsTableHeader");

    // Move the display records per page dropdown
    $("#recordsTable_length").appendTo(".dtrs-display-no-list");
    $("#recordsTable_length label").addClass("d-flex align-items-center");
    
    // Move the pagination controls to the custom div
    $("#recordsTable_paginate").detach().appendTo("#DTRSpaginationControls");

    // Move the info about pages to your custom div
    $("#recordsTable_info").appendTo(".dtrs-page-info");
    // Update the page info on table redraw (pagination, search, etc.)
    table.on("draw", function () {
        $("#recordsTable_info").appendTo(".dtrs-page-info");
    });

    // Prevent future dates
    const today = new Date().toISOString().split("T")[0];
    $("#dateFrom").attr("max", today);
    $("#dateTo").attr("max", today);

    // Custom date filter
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const dateFrom = $("#dateFrom").val();
        const dateTo = $("#dateTo").val();
        const dateCol = data[5]; // Assuming 'Date' is in the 6th column (index 5)

        if (dateFrom === "" && dateTo === "") {
            return true; // No filtering if no date is selected
        }

        const date = new Date(dateCol);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && to && to < from) {
            alert("Date To cannot be earlier than Date From.");
            $("#dateTo").val(""); // Clear the Date To field
            return false;
        }

        if ((from === null || date >= from) && (to === null || date <= to)) {
            return true;
        }

        return false;
    });

    // Filter button click event
    $("#filterBtn").on("click", function () {
        const dateFrom = $("#dateFrom").val();
        const dateTo = $("#dateTo").val();
        if (!dateFrom || !dateTo) {
            alert("Both Date From and Date To are required.");
            return; // Stop the execution if dates are missing
        }
        table.draw();
        showLoadingModal();
        setTimeout(function () {
            $("#loadingModal").fadeOut(function () {
                $("#contentBody").fadeIn();
            });
        }, 2000);
    });

    // Clear filter button click event
    $("#clearBtn").on("click", function () {
        $("#dateFrom").val("");
        $("#dateTo").val("");
        table.draw(); // Redraw table to clear filters
    });

    // Validate date inputs dynamically
    $("#dateFrom, #dateTo").on("change", function () {
        const dateFrom = new Date($("#dateFrom").val());
        const dateTo = new Date($("#dateTo").val());

        if (dateTo < dateFrom) {
            alert("Date To cannot be earlier than Date From.");
            $(this).val(""); // Clear the invalid field
        }
    });
    
    setTimeout(function () {
        closeModal();
        $("#recordsTableBody").css("display", "table-row-group");
        initializeMapsOnCurrentPage();
    }, 300); // 500 milliseconds

    // Event delegation for thumbnail images
    $("#recordsTableBody").on("click", "#thumbnail-img", function (event) {
        const row = $(this).closest("tr"); // Get the closest table row
        const empID = row.find("td").eq(0).text(); // Assuming empID is in the second column (index 1)
        console.log("Image clicked. Row ID:", empID); // Log the employee ID
        openImgModal(event); // Open the image modal
    });

    // Event delegation for small maps
    $("#recordsTableBody").on("click", ".map-small-list", function (event) {
        const row = $(this).closest("tr"); // Get the closest table row
        const empID = row.find("td").eq(0).text(); // Assuming empID is in the second column (index 1)
        console.log("Map clicked. Row ID:", empID); // Log the employee ID

        const lat = parseFloat($(this).data("latitude"));
        const long = parseFloat($(this).data("longitude"));
        if (isNaN(lat) || isNaN(long)) {
            console.error("Invalid latitude or longitude", lat, long);
        }
        console.log("Latitude:", lat, "Longitude:", long); // Add this line
        const address = row.find("td").eq(8).text() || "Unknown location"; // Assuming address is in the 9th column (index 8)
        initializeModalMap(lat, long, "Location: " + address);
    });

    // Event listener for closing the modal
    closeBtn.addEventListener("click", function () {
        closeImgModal();
        destroyModalMap(); // Destroy the map when closing the modal
    });

    // Function to destroy the modal map
    function destroyModalMap() {
        if (modalMap) {
            modalMap.off(); // Remove event listeners
            modalMap.remove(); // Remove the map from the DOM
            modalMap = null; // Set the modalMap variable to null
        }
    }

    // Combined click event for modals
    $(window).on("click", function (event) {
        const mapModalList = document.getElementById("mapModalList");

        // Close image modal if clicked outside
        if (event.target == $("#imgModal")[0]) {
            closeImgModal();
        }

        // Close map modal if clicked outside
        if (event.target === mapModalList) {
            mapModalList.classList.remove("active");
            setTimeout(() => {
                mapModalList.style.display = "none"; // Hide the modal after transition
            }, 300); // Wait for transition to complete
        }
    });

    // Add event listener for DataTable page change
    table.on("draw", function () {
        initializeMapsOnCurrentPage();
    });
});

function showLoadingModal() {
    document.getElementById("loadingModal").style.display = "block";
}

function closeModal() {
    document.getElementById("loadingModal").style.display = "none";
}

function initializeMapsOnCurrentPage() {
    $("#recordsTableBody .map-small-list").each(function () {
        // Use latitude and longitude from Record data (set in the data attributes)
        const lat = parseFloat($(this).data("latitude")) || 14.29047;
        const lng = parseFloat($(this).data("longitude")) || 121.00429;
        const mapElement = this;

        // Initialize the small map only once
        const map = L.map(mapElement, {
            center: [lat, lng],
            zoom: 17,
            dragging: false,
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            keyboard: false,
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            minZoom: 13,
        }).addTo(map);

        // Add a marker
        L.marker([lat, lng]).addTo(map);
    });
}

let activeModalMap = null; // Use a new name for the modal map variable

function initializeModalMap(lat, lng, content) {
    console.log("Initializing map at:", lat, lng); // Debugging
    const mapModalList = document.getElementById("mapModalList");
    const modalMapList = document.getElementById("modalMapList");

    if (activeModalMap) {
        activeModalMap.off();
        activeModalMap.remove();
        activeModalMap = null;
    }

    activeModalMap = L.map(modalMapList, {
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true,
    }).setView([lat, lng], 19);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap",
    }).addTo(activeModalMap);

    L.marker([lat, lng]).addTo(activeModalMap).bindPopup(content);

    mapModalList.style.display = "flex";

    setTimeout(() => {
        mapModalList.classList.add("active");
        activeModalMap.invalidateSize();
    }, 100);
}

document.getElementById("exportCsvBtn").addEventListener("click", function () {
    exportToCSV();
});
function exportToCSV() {
    const table = $("#recordsTable").DataTable();

    // Check if there are any records
    if (table.data().count() === 0) {
        alert("No records available for export.");
        return;
    }

    const rows = [];

    const headers = [
        "No.", // No.
        "empID", // Employee ID
        "Departamento", // Department
        "Full Name", // Full Name
        "Time", // Time
        "Date", // Date
        "Actividad", // Activity
        "Imahe", // Image presence indicator
        "Address", // Address
        "Latitude", // Changed from Location to Latitude
        "Longitude", // Changed from Created At to Longitude
    ];
    rows.push(headers.join(","));

    table.rows().every(function () {
        const rowData = this.data();
        const row = [
            this.index() + 1, // No.
            rowData[1], // empID
            rowData[2], // Department
            rowData[3], // Full Name
            rowData[4], // Time
            rowData[5], // Date
            rowData[6], // Activity
            rowData[7] ? "Image present" : "No Image", // Image presence indicator
            `"${rowData[8]}"`, // Address
            $(rowData[9]).data("latitude"), // Latitude
            $(rowData[9]).data("longitude"), // Longitude
        ];

        rows.push(row.join(","));
    });

    // Create a CSV file and trigger download
    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dtrs_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadRecords(dateFrom = "", dateTo = "") {
    // Show loading modal before starting the data fetch
    showLoadingModal();

    // Clear the table body to avoid showing previous records
    const recordsTableBody = $("#recordsTableBody");
    recordsTableBody.empty(); // Clear the table body

    // Prepare the data object for the AJAX request
    const data = {};
    if (dateFrom) data.dateFrom = dateFrom;
    if (dateTo) data.dateTo = dateTo;

    $.ajax({
        url: "/dtrs/getRecords", // Ensure this route matches the server-side
        type: "GET",
        data: data, // Send only non-empty parameters
        success: function (data) {
            console.log(data.records);
            // Check if any records are returned
            if (data.records.length > 0) {
                data.records.forEach((record, index) => {
                    recordsTableBody.append(`
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${record.employee.empID}</td>
                                    <td>${record.employee.dept}</td>
                                    <td>${[
                                        record.employee.fname,
                                        record.employee.mname,
                                        record.employee.lname,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                                        .trim()}</td>
                                    <td>${record.time}</td>
                                    <td>${record.date}</td>
                                    <td>${record.act}</td>
                                    <td>
                                        <img src="${
                                            record.img
                                                ? "data:image/jpeg;base64," +
                                                    record.img
                                                : "/path/to/default_image.jpg"
                                        }" 
                                            alt="Employee Picture" 
                                            style="width:100px; height:100px;" 
                                            class="thumbnail-img" 
                                            data-full-img="${
                                                record.img
                                                    ? "data:image/jpeg;base64," +
                                                        record.img
                                                    : "/path/to/default_image.jpg"
                                            }"
                                            loading="lazy">
                                    </td>
                                    <td>${record.address}</td>
                                    <td>
                                        <div class="map-small-list" id="maplist-${index}" 
                                            style="width: 300px; height: 120px;" 
                                            data-latitude="${record.lat}" 
                                            data-longitude="${record.long}">
                                        </div>
                                    </td>
                                    <td style="display: none;">${
                                        record.createdAt
                                    }</td>
                                </tr>
                            `);
                });
                $("#recordsTableBody").css("display", "table-row-group");
            } else {
                recordsTableBody.append(
                    '<tr><td colspan="11" style="text-align: center;">No records found.</td></tr>'
                );
            }

            // Reinitialize maps and DataTable
            initializeMapsOnCurrentPage();
            $("#recordsTable").DataTable().draw();

            // Hide loading modal after data is loaded
            closeModal();
        },
        error: function (err) {
            console.error("Error fetching records:", err);
            alert("Failed to load records. Please try again.");

            // Hide loading modal in case of error
            closeModal();
        },
    });
}

const closeBtn = document.getElementById("closeImageModal");
const dtrslistmodal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalListImage");

// Function to open the modal with a smooth transition
function openImgModal(event) {
    dtrslistmodal.style.display = "flex"; // Ensure modal is displayed
    setTimeout(() => {
        dtrslistmodal.classList.add("show"); // Show the modal
        modalImg.src = event.target.src; // Set the clicked image's source
    }, 100);
}

// Function to close the modal
function closeImgModal() {
    dtrslistmodal.classList.remove("show"); // Hide the modal
    setTimeout(() => {
        dtrslistmodal.style.display = "none";
    }, 300); // Wait for transition to complete
}
