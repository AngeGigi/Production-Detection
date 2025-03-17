$(document).ready(function () {
    // Set today's date as the max date for both Date From and Date To inputs
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    $("#uniqueDateFrom, #uniqueDateTo").attr("max", today);
    const table = $("#reportsTable").DataTable({
        order: [], 
        columnDefs: [{ orderable: false, targets: [] }], // Adjust as needed
        language: {
            lengthMenu: "Show _MENU_",
            zeroRecords: "No matching records found",
            info: "Showing page _PAGE_ of _PAGES_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
            search: "",
        },
        // Adding Bootstrap styling to DataTable
        dom: 'Bfrtip', // Buttons, Filter, table, info, pagination
        buttons: [
            {
                extend: 'csvHtml5',
                text: 'Export to CSV',
                className: 'btn btn-outline-primary'
            }
        ],
        responsive: true, // Enable responsive tables (optional)
    });

    // Custom date filter with validation for Date To not being before Date From
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        const dateFrom = $("#uniqueDateFrom").val();
        const dateTo = $("#uniqueDateTo").val();
        const dateCol = data[3]; // Assuming 'Date' is in the 4th column (index 3)

        if (!dateFrom && !dateTo) return true; // If both dates are not provided, no filter is applied

        // Convert 'dateCol' to Date object
        const recordDate = new Date(dateCol);

        // Create Date objects for the 'From' and 'To' filter values
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        // Validate if Date To is not earlier than Date From
        if (fromDate && toDate && toDate < fromDate) {
            alert("Date To cannot be earlier than Date From.");
            // Clear the date fields after showing the alert
            $("#uniqueDateFrom").val("");
            $("#uniqueDateTo").val("");
            table.draw(); // Redraw the table to apply the cleared filters
            return false; // Prevent applying the filter
        }

        // Strip time components from recordDate, fromDate, and toDate for accurate comparison
        const stripTime = date => new Date(date.setHours(0, 0, 0, 0));

        return (
            (!fromDate || stripTime(recordDate) >= stripTime(fromDate)) &&
            (!toDate || stripTime(recordDate) <= stripTime(toDate))
        );
    });

    // Filter button
    $("#uniqueFilterBtn").on("click", function () {
   
        table.draw();
    });

    // Clear filter button
    $("#uniqueClearBtn").on("click", function () {
        $("#uniqueDateFrom").val("");
        $("#uniqueDateTo").val("");
        table.draw();
    });

    // Export to CSV
    $("#uniqueExportBtn").on("click", function () {
        console.log("Export button clicked");
    
        if (table.data().count() === 0) {
            alert("No records available for export.");
            return;
        }
    
        const rows = [];
        // Add table headers
        rows.push([
            "Company Code",
            "Company Name",
            "Time",
            "Date",
            "Activity",
            "Subscription Status",
        ]);
    
        // Add table data for the filtered rows
        table.rows({ search: 'applied' }).every(function () {
            const data = this.data();
            rows.push(data.slice(0, 6)); // Extract relevant columns
        });
    
        // Convert rows to CSV string
        const csvContent = rows.map(e => e.join(",")).join("\n");
    
        // Create a Blob and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "companies_report-logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
});
