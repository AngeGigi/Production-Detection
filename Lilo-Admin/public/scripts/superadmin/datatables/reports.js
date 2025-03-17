$(document).ready(function () {
    window.table = $("#reportsTable").DataTable({
        order: [ ],
        deferRender: true,
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
        dom: "lBfrtip",
        buttons: [
            {
                extend: "csvHtml5",
                text: "Export to CSV",
                className: "btn btn-outline-primary",
            },
        ],
        responsive: true,
    });

    $("#reportsTable_filter").appendTo(".reports-search-area");
    $("#reportsTable_filter label").addClass("w-100");
    $("#reportsTable thead").appendTo("#reportsTableHeader");
    $("#reportsTable_length").appendTo(".reports-display-no-list");
    $("#reportsTable_length label").addClass("d-flex align-items-center");
    $("#reportsTable_paginate").detach().appendTo("#reportspaginationControls");
    $("#reportsTable_info").appendTo(".reports-page-info");

    table.on("draw", function () {
        $("#reportsTable_info").appendTo(".reports-page-info");
    });
});
