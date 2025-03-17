const changeStat = document.getElementById("changeStat");
const changeOverlay = document.getElementById("changeOverlay");
const changeStatCancel = document.getElementById("changeStatCancel");

$(document).ready(function () {
    $('#loadingEmpModal').show();
      $('#contentEmpBody').hide();

      setTimeout(function() {
        $('#loadingEmpModal').fadeOut(function() {
          $('#contentEmpBody').fadeIn(); 
        });
      }, 2000);
    const table = $("#employeeTable").DataTable({
        deferRender: true,
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        columnDefs: [{ orderable: false, targets: [8] }],
        language: {
            lengthMenu: "Show _MENU_",
            zeroRecords: "No matching records found",
            info: "Showing page _PAGE_ of _PAGES_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
            search: "",
            searchPlaceholder: "Search Employees",
            paginate: {
                previous: "<<",
                next: ">>",
            },
        },
    });

    // Move the search box to the header
    $("#employeeTable_filter").appendTo(".search-area-list");
    $("#employeeTable_filter label").addClass("w-100");
    $("#employeeTable thead").appendTo("#employeeTableHeader");

    // Move the display records per page dropdown
    $("#employeeTable_length").appendTo(".display-no-list");
    $("#employeeTable_length label").addClass("d-flex align-items-center");
    
    // Move the pagination controls to the custom div
    $("#employeeTable_paginate").detach().appendTo("#paginationControls");

    // Move the info about pages to your custom div
    $("#employeeTable_info").appendTo(".page-info");
    // Update the page info on table redraw (pagination, search, etc.)
    table.on("draw", function () {
        $("#employeeTable_info").appendTo(".page-info");
    });


    // Add event listener for empStatBtn
    $("#employeeTableBody").on("click", ".empStatBtn", function () {
        const employeeRow = $(this).closest("tr");
        const employeeName = employeeRow.find("td:nth-child(2)").text(); // Full Name in the second column
        const currentStatus = employeeRow.find(".currentStat").val();
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active"; // Determine the new status

        // Store the employee ID for use when confirming the status change
        const employeeId = employeeRow.data("id"); // Use data-id from the closest tr
        $("#changeStatConfirm").data("employeeId", employeeId);
        console.log("Employee ID", employeeId);

        // Set the modal content
        $("#statName").text(employeeName); // Set the employee's name
        $("#statChange").text(newStatus); // Set the new status

    });

    // Confirm button functionality (to be expanded with actual status change logic)
    $("#changeStatConfirm").click(function () {
        // Get employee ID from the row or button
        const employeeId = $(this).data("employeeId");
        console.log("Employee ID", employeeId);
        const newStatus = $("#statChange").text().trim(); // Get the new status from modal

        // Send an AJAX request to update the status
        $.ajax({
            url: `/homepage/edit-employee/${employeeId}`, // Your endpoint to handle the status update
            method: "PUT",
            data: {
                id: employeeId,
                empStat: newStatus,
            },
            success: function (response) {
                // Reload the page or update the UI based on the response
                console.log("Status updated successfully");
                location.reload(); // Reload page to reflect the updated status
            },
            error: function (error) {
                console.error("Error updating status:", error);
            },
        });

    });
});
