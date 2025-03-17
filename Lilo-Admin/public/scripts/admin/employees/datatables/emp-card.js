$(document).ready(function () {
    // Initialize DataTable (Table stays hidden but controls card pagination)
    let table = $('#employeesTable').DataTable({
        paging: true,
        searching: true,
        info: false,
        lengthChange: true,
        pageLength: 10,  // Default number of records per page
        order: [[1, 'asc']],  // Default sorting by name
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
        initComplete: function () {
            // Move search box to custom div
            let searchBox = $('#employeesTable_filter').detach();
            $('#employeesSearchBox').append(searchBox);
            $('#employeesTable_filter label').addClass("w-100");

            // Move length change dropdown to custom div
            let lengthDropdown = $('#employeesTable_length').detach();
            $('#employeesCardLimit').append(lengthDropdown);
            $('#employeesTable_length label').addClass("d-flex align-items-center");
            $('#employeesTable_length select').addClass("ms-2");

            // Move pagination to custom div
            let paginationControls = $('#employeesTable_paginate').detach();
            $('#employeesCardPagination').append(paginationControls);
        }
    });

    // Hide the table as we're only using the data
    $('#employeesTable').hide();

    // Function to render paginated card view
    function renderCards() {
        let cardContainer = $('#employees-card-view');
        cardContainer.empty(); // Clear previous cards

        // Get data only for the current page after pagination
        let currentPageData = table.rows({ page: 'current', search: 'applied' }).data();

        currentPageData.each(function (row) {
            let id = row[0];
            let fname = row[1];
            let empID = row[2];
            let dept = row[3];
            let email = row[4];
            let empStat = row[5];
            let empPic = row[6];

            let badgeClass = empStat === 'Active' 
                ? 'bg-success' 
                : empStat === 'Pending' 
                    ? 'bg-warning' 
                    : empStat === 'Inactive' 
                        ? 'bg-danger' 
                        : 'bg-secondary';

            let card = $(`
                <div class="col" style="flex: 1 1 300px; max-width: 400px;">
                    <div class="card card-hover h-100" data-bs-toggle="modal" data-bs-target="#editEmpModal" 
                        data-id="${id}" data-name="${empID}" data-dept="${dept}" data-email="${email}">
                        <div class="card-body d-flex align-items-center">
                            <div class="emp-icon position-relative me-3" style="width: 70px; height: 70px;">
                                <input type="hidden" class="hidden-card-id" value="${id}" id="dbid">
                                <img class="emp-pic rounded-circle" 
                                    src="${empPic ? `data:image/jpeg;base64,${empPic}` : '/pics/default-pic.jpg'}" 
                                    alt="Employee Picture" 
                                    style="width: 100%; height: 100%; object-fit: cover;">
                                <input type="hidden" class="emp-stat-value" value="${empStat}">
                                <span class="badge emp-stat ${badgeClass} position-absolute bottom-0 end-0 rounded-circle p-2 custom-tooltip-top"
                                    data-tooltip="${empStat}"
                                    style="transform: translate(-30%, 0%);">
                                </span>
                            </div>
                            <div class="emp-info flex-grow-1">
                                <h5 class="card-text emp-name fs-6">${fname}</h5>
                                <p class="card-text emp-id text-muted fs-7">${empID}</p>
                                <p class="card-text emp-dept fs-7">
                                    <i class="bi bi-buildings-fill me-1"></i> ${dept}
                                </p>
                                <p class="card-text emp-email fs-7">
                                    <i class="fas fa-envelope me-1"></i> ${email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            cardContainer.append(card);
        });

        attachCardEventListener();
    }

    // Initial render
    renderCards();

    // Re-render on pagination, length change, and search events
    table.on('draw', renderCards);
    table.on('search.dt', renderCards);
    table.on('length.dt', renderCards);

    // Sorting and filtering based on dropdown selection
    $('#empCardSortCriteria').on('change', function () {
        let selectedValue = $(this).val();

        switch (selectedValue) {
            case 'empID':
                table.search('').columns().search('').draw();
                table.order([2, 'asc']).draw();  // Sorting by Employee ID (empID in column 2)
                break;
            case 'fullName':
                table.search('').columns().search('').draw();
                table.order([1, 'asc']).draw();  // Sorting by Full Name (fullName in column 1)
                break;
            case 'dept':
                table.search('').columns().search('').draw();
                table.order([3, 'asc']).draw();  // Sorting by Department (dept in column 3)
                break;
            case 'email':
                table.search('').columns().search('').draw();
                table.order([4, 'asc']).draw();  // Sorting by Email (email in column 4)
                break;
            case 'active':
                table.columns(5).search('^Active$', true, false).draw();
                break;
            case 'inactive':
                table.columns(5).search('^Inactive$', true, false).draw();
                break;
            default:
                table.search('').columns().search('').draw();  // Reset filters and sorting
                break;
        }
    });
});
