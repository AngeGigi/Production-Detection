$(document).ready(function () {
    window.table = $("#companiesTable").DataTable({
        order: [[10, "desc"]],
        columnDefs: [{ orderable: false, targets: 6 }],
        deferRender: true,
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        language: {
            lengthMenu: "Show _MENU_",
            zeroRecords: "No matching records found",
            info: "Showing page _PAGE_ of _PAGES_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
            search: "",
            searchPlaceholder: "Search ...",
            paginate: {
                previous: "<<",
                next: ">>",
            },
        },
    });

    // Move the search box to the header
    $("#companiesTable_filter").appendTo(".complist-search-area");
    $("#companiesTable_filter label").addClass("w-100");
    $("#companiesTable thead").appendTo("#companiesTableHeader");

    // Move the display records per page dropdown
    $("#companiesTable_length").appendTo(".complist-display-no-list");
    $("#companiesTable_length label").addClass("d-flex align-items-center");

    // Move the pagination controls to the custom div
    $("#companiesTable_paginate")
        .detach()
        .appendTo("#CompListpaginationControls");

    // Move the info about pages to your custom div
    $("#companiesTable_info").appendTo(".complist-page-info");
    // Update the page info on table redraw (pagination, search, etc.)
    table.on("draw", function () {
        $("#companiesTable_info").appendTo(".complist-page-info");
    });
});
