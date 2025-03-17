$(document).ready(function () {
    // Initialize DataTable (Table stays hidden but controls card pagination)
    let table = $('#dtrsTable').DataTable({
        paging: true,
        searching: true,
        info: false,
        lengthChange: true,
        pageLength: 10,  // Default number of records per page
        order: [[3, 'desc']],
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
        initComplete: function () {
            // Move search box to custom div
            let searchBox = $('#dtrsTable_filter').detach();
            $('#DTRSsearchCard').append(searchBox);
            $('#dtrsTable_filter label').addClass("w-100");

            // Move length change dropdown to custom div
            let lengthDropdown = $('#dtrsTable_length').detach();
            $('#DTRScardLimit').append(lengthDropdown);
            $('#dtrsTable_length label').addClass("d-flex align-items-center");
            $('#dtrsTable_length select').addClass("ms-2");
            
            // Move pagination to custom div
            let paginationControls = $('#dtrsTable_paginate').detach();
            $('#DTRSCardpaginationControls').append(paginationControls);
        }
    });

    // Hide the table as we're only using the data
    $('#dtrsTable').hide();

    table.on('draw', function () {
        let tableWrapper = $('#dtrsTable_wrapper'); // Wrapper div of DataTables
        let zeroRecordsDiv = $('#notif-info-area'); // Your custom div for zeroRecords message
        let cardArea = $('#dtrs-card-view');

        if (table.rows({ search: 'applied' }).data().length === 0) {
            // Show the zeroRecords message with the styled HTML
            zeroRecordsDiv.html(`
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        No Records Found
                    </div>
            `).show();
            cardArea.hide();
        } else {
            // Hide the zeroRecords message
            cardArea.show();
            zeroRecordsDiv.hide();
        }
    });

    // Function to render paginated card view
    function renderCards() {
        let cardContainer = $('#dtrs-card-view');
        cardContainer.empty(); // Clear previous cards
    
        // Get data only for the current page after pagination
        let currentPageData = table.rows({ page: 'current', search: 'applied' }).data();
    
        currentPageData.each(function (row) {
            let id = row[0];
            let act = row[1];
            let img = row[2];
            let time = row[3] || 'Not Checked In';
            let empID = row[4];
            let fullName = row[5];
            let lat = row[6];
            let long = row[7];
            let address = row[8] || 'No Address Provided';
    
            let bgColor = act === 'in' ? 'bg-primary' : 'bg-secondary';
            let textColor = act === 'in' ? 'text-primary' : 'text-secondary';
    
            let card = $(`
                <div id="dtrs-cards" class="col-12 col-sm-6 col-md-4 col-lg-2-5"  style="flex: 1 1 300px; max-width: 400px;">
                    <div class="card card-hover border-0">
                        <div id="record-activity" class="card-header text-center text-white ${bgColor}">
                            <strong class="fs-6">LOG <span>${act.toUpperCase()}</span></strong>
                        </div>
                        <div class="card-body text-center">
                            <div class="d-flex">
                                <div class="col-5 d-flex align-items-center justify-content-center">
                                    <img src="${img}" alt="Employee Picture" class="img-fluid"
                                        style="width: 100px; height: 100px; object-fit: cover;" />
                                </div>
                                <h5 id="record-time" class="col-7 d-flex justify-content-center align-items-center ${textColor} fw-bold fs-4">
                                    ${time}
                                </h5>
                            </div>
                            <p id="record-id" class="mb-1 fs-7 col-5">${empID}</p>
                            <p id="record-full-name" class="fw-bold text-dark fs-6">${fullName}</p>
                            <div id="map-${id}" data-lat="${lat}" data-long="${long}" class="map-small border rounded p-2 bg-light w-100" style="height: 120px;">
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <i class="fa-solid fa-location-dot ${textColor} me-2"></i>
                                <span id="address-text" class="small text-truncate" title="${address}">
                                    ${address.length > 40 ? address.substring(0, 40) + '...' : address}
                                </span>
                                <button class="btn ${textColor} btn-sm pe-0" onclick="copyAddress('${address.replace(/'/g, '\\\'')}')" title="Copy Address">
                                    <i class="fa-solid fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
    
            cardContainer.append(card);
        });
    
        updateMaps(); // Call map update function if necessary
    }
    

    // Initial render
    renderCards();

    // Re-render on pagination, length change, and search events
    table.on('draw', renderCards);
    table.on('search.dt', renderCards);
    table.on('length.dt', renderCards);

    // Sorting and filtering based on dropdown selection
    $('#cardSortCriteria').on('change', function () {
        let selectedValue = $(this).val();

        switch (selectedValue) {
            case 'employeeId':
                table.search('').columns().search('').draw();
                table.order([4, 'asc']).draw();
                break;
            case 'fullName':
                table.search('').columns().search('').draw();
                table.order([5, 'asc']).draw();
                break;
            case 'check-in':
                table.columns(1).search('^in$', true, false).draw();
                break;
            case 'check-out':
                table.columns(1).search('^out$', true, false).draw();
                break;
            default:
                table.search('').columns().search('').draw();  // Reset filters
                break;
        }
    });

});
