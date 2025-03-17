window.onload = function () {
    fetch('/reports/end-of-day', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    });
 
    const token = sessionStorage.getItem('token');
    const expiration = sessionStorage.getItem('expiration');
    const compCode = sessionStorage.getItem('compCode');
    if (token && expiration && compCode) {
        console.log('Token:', token);
        console.log('Expiration:', expiration);
        console.log('CompCode:', compCode);
 
        document.getElementById('token-display').textContent = `Token: ${token}`;
        document.getElementById('expiration-display').textContent = `Expiration: ${expiration}`;
        document.getElementById('compCode-display').textContent = `CompCode: ${compCode}`;
    }
 
    $(document).ready(function () {
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
        $("#dateFilter").attr("max", today); // Set the max attribute to today's date
              // $("#dateFilter").val(today); // Set today's date as the default value
 
 
        // Initialize all DataTables
        initializeDataTable("#diffLocationsTable", "#search-1", "Location", 2, 1, "#paginate-1", "#display-1", "#totalLoggedIn", today);
        initializeDataTable("#lateRecordsTable", "#search-2", "Employee", 2, 1, "#paginate-2", "#display-2", "#totalLate", today);
        initializeDataTable("#withoutLogoutTable", "#search-3", "Employee", 2, 1, "#paginate-3", "#display-3", "#totalWithoutLogout", today);
        initializeDataTable("#withoutLoginTable", "#search-4", "Employee", 2, 1, "#paginate-4", "#display-4", "#totalWithoutLogin", today);
 
        // Department Filter
        $("#departmentDropdown").on("change", function () {
            const selectedDepartment = $(this).val();
            filterTablesByDepartment(selectedDepartment);
        });
 
        // Date Filter
        $("#dateFilter").on("change", function () {
            const selectedDate = this.value;
            console.log('Selected Date:', selectedDate); // Log selected date
            filterTablesByDate(selectedDate);
        });
 
        // Clear Button for Date Filter
        $("#clearButton").on("click", function () {
            $("#dateFilter").val(''); // Clear the date filter
            filterTablesByDate(''); // Reset the filter for all tables
        });
    });
};
 
function initializeDataTable(tableId, searchBoxId, placeholder, dateColumnIndex, deptColumnIndex, paginationContainer, lengthContainer, infoContainer, defaultDate) {
    // Ensure the table exists
    if (!$(tableId).length) {
        console.error(`Table with ID ${tableId} does not exist in the DOM.`);
        return;
    }
 
    // Destroy DataTable if already initialized
    if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
    }
 
    try {
        // Initialize the DataTable
        const table = $(tableId).DataTable({
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            language: {
                lengthMenu: "Show _MENU_",
                zeroRecords: "No matching records found",
                info: "_TOTAL_ / _MAX_",
                infoEmpty: "0 / _MAX_",
                infoFiltered: "",
                search: "",
                searchPlaceholder: `Search ${placeholder}`,
                paginate: {
                    previous: "<<",
                    next: ">>",
                },
            },
            lengthMenu: [10, 25, 50],
           
            initComplete: function () {
                try {
                    if (table) {
                        table
                            .column(dateColumnIndex) // Target the date column
                            .search(defaultDate) // Apply today's date filter
                            .draw();
                    } else {
                        console.error(`Table initialization failed for ${tableId}.`);
                    }
                } catch (error) {
                    console.error(`Error applying date filter to column ${dateColumnIndex} for table ${tableId}:`, error);
                }
            },
        });
 
        // Attach elements to specific containers
        $(`${tableId}_info`).detach().appendTo(infoContainer).addClass("d-flex justify-content-center");
        $(`${tableId}_filter`).detach().appendTo(searchBoxId).find("input");
        $(`${tableId}_length`).detach().appendTo(lengthContainer);
        $(`${tableId}_paginate`).detach().appendTo(paginationContainer).addClass("d-flex justify-content-center");
 
    } catch (error) {
        console.error(`Failed to initialize DataTable for ${tableId}:`, error);
    }
}
 
// Function to filter tables by department
function filterTablesByDepartment(department) {
    const tables = [
        '#diffLocationsTable',
        '#lateRecordsTable',
        '#withoutLogoutTable',
        '#withoutLoginTable',
    ];
 
    tables.forEach((tableId) => {
        const table = $(tableId).DataTable();
        table
            .column(2) // Column 2 for department
            .search(department === "all" ? '' : department)
            .draw();
    });
}
 
// Function to filter tables by date
function filterTablesByDate(date) {
    const tables = [
        '#diffLocationsTable',
        '#lateRecordsTable',
        '#withoutLogoutTable',
        '#withoutLoginTable',
    ];
 
    tables.forEach((tableId) => {
        const table = $(tableId).DataTable();
        table
            .column(1) // Column 1 for the date column
            .search(date)
            .draw();
    });
}