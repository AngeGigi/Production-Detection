$(document).ready(function () {
    $('#loadingRejModal').show();
    $('#contentRejBody').hide();

    setTimeout(function () {
        $('#loadingRejModal').fadeOut(function () {
            $('#contentRejBody').fadeIn();
        });
    }, 1000);

    fetch('/reports/rejected-logs', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        }
    });

    // Retrieve stored values from sessionStorage
    const token = sessionStorage.getItem('token');
    const expiration = sessionStorage.getItem('expiration');
    const compCode = sessionStorage.getItem('compCode');

    // Display token, expiration, and compCode on the page if they exist
    if (token && expiration && compCode) {
        console.log('Token:', token);
        console.log('Expiration:', expiration);
        console.log('CompCode:', compCode);

        document.getElementById('token-display').textContent = `Token: ${token}`;
        document.getElementById('expiration-display').textContent = `Expiration: ${expiration}`;
        document.getElementById('compCode-display').textContent = `CompCode: ${compCode}`;
    }

    const table = $("#rejectedlogsTable").DataTable({
        deferRender: true,
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        columnDefs: [{ orderable: false, targets: [7] }],
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
    $("#rejectedlogsTable_filter").appendTo(".rejlog-search-area-list");
    $("#rejectedlogsTable_filter label").addClass("w-100");
    $("#rejectedlogsTable thead").appendTo("#rejectedlogsTableHeader");

    // Move the display records per page dropdown
    $("#rejectedlogsTable_length").appendTo(".rejlog-display-no-list");
    $("#rejectedlogsTable_length label").addClass("d-flex align-items-center");

    // Move the pagination controls to the custom div
    $("#rejectedlogsTable_paginate").detach().appendTo("#RejLogspaginationControls");

    // Move the info about pages to your custom div
    $("#rejectedlogsTable_info").appendTo(".rejlog-page-info");
    table.on("draw", function () {
        $("#rejectedlogsTable_info").appendTo(".rejlog-page-info");
    });

    const today = new Date().toISOString().split("T")[0];
    $("#rejlogsdateFrom").attr("max", today);
    $("#rejlogsdateTo").attr("max", today);

    // Custom filter function
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const dateFrom = $("#rejlogsdateFrom").val();
        const dateTo = $("#rejlogsdateTo").val();
        const dateCol = data[5]; // Assuming 'Date' is in the 5th column (index 4)

        if (!dateFrom && !dateTo) {
            return true; // No filtering if no date is selected
        }

        const date = new Date(dateCol);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (
            (from === null || date >= from) &&
            (to === null || date <= to)
        ) {
            return true;
        }
        return false;
    });

    // Filter button click event
    $("#rejlogsfilterBtn").on("click", function () {
        const dateFrom = $("#rejlogsdateFrom").val();
        const dateTo = $("#rejlogsdateTo").val();

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
    $("#rejlogsclearBtn").on("click", function () {
        $("#rejlogsdateFrom").val("");
        $("#rejlogsdateTo").val("");
        table.draw(); // Redraw table to clear filters
    });

    // Validate date inputs dynamically
    $("#rejlogsdateFrom, #rejlogsdateTo").on("change", function () {
        const dateFrom = new Date($("#rejlogsdateFrom").val());
        const dateTo = new Date($("#rejlogsdateTo").val());
        const today = new Date();

        if (dateFrom > today) {
            alert("Date From cannot be in the future.");
            $("#rejlogsdateFrom").val(""); // Clear the invalid field
        }

        if (dateTo > today) {
            alert("Date To cannot be in the future.");
            $("#rejlogsdateTo").val(""); // Clear the invalid field
        }

        if (dateTo < dateFrom) {
            alert("Date To cannot be earlier than Date From.");
            $(this).val(""); // Clear the invalid field
        }
    });

    function showLoadingModal() {
        document.getElementById("loadingModal").style.display =
            "block";
    }

    function closeModal() {
        document.getElementById("loadingModal").style.display =
            "none";
    }
    // Export to CSV function
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportTableToCSV(filename) {
        const csv = [];

        // Add headers
        const headers = Array.from(
            document.querySelectorAll("#rejectedlogsTable th")
        ).slice(1).map((th) => th.innerText);
        csv.push(headers.join(","));

        // Add rows
        table.rows().every(function () {
            const row = this.data(); // Access data of the current row

            const csvRow = [
                row[1], // Employee ID
                row[2], // Department
                row[3], // Full name
                row[4], // Time
                row[5], // Date
                row[6], // Action
                row[7] ? "Picture Present" : "No Picture", // Image
                row[8],
            ].join(",");

            csv.push(csvRow);
        });

        downloadCSV(csv.join("\n"), filename);
    }

    document
        .getElementById("export-rejected")
        .addEventListener("click", function () {
            exportTableToCSV("rejected_logs.csv");
        });

    // Event delegation for thumbnail images
    $("#rejectedlogsTableBody").on("click", "#rejlog-thumbnail-img", function (event) {
        const row = $(this).closest("tr"); // Get the closest table row
        const empID = row.find("td").eq(0).text(); // Assuming empID is in the second column (index 1)
        console.log("Image clicked. Row ID:", empID); // Log the employee ID
        openrejImgModal(event); // Open the image modal
    });
});


const rejlogsmodal = document.getElementById("picModal");
const rejlogmodalImg = document.getElementById("modalPic");

// Function to open the modal with a smooth transition
function openrejImgModal(event) {
    rejlogsmodal.style.display = "flex"; // Ensure modal is displayed
    setTimeout(() => {
        rejlogsmodal.classList.add("show");
        rejlogmodalImg.src = event.target.src; // Show the modal with transition
    }, 100);
}

// Function to close the modal
function closerejImgModal() {
    rejlogsmodal.classList.remove("show"); // Hide the modal with transition
    setTimeout(() => {
        rejlogsmodal.style.display = "none"; // Hide after transition completes
    }, 300); // Adjust this delay to match your CSS transition time
}

// Event listener to close the modal when the close button is clicked
document.getElementById("closePicModal").addEventListener("click", closerejImgModal);

// Event listener to close the modal when clicking outside the modal content
rejlogsmodal.addEventListener("click", function (event) {
    if (event.target === rejlogsmodal) {
        closerejImgModal();
    }
});