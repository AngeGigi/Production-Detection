async function fetchNotices() {
    try {
        const compName = await fetchCompNameFromSession();
        document.getElementById('modalCompName').innerHTML = `<strong>${compName}</strong>`;
        const response = await $.ajax({
            url: '/admin/notices',
            method: 'GET',
        });

        if (response.data && Array.isArray(response.data)) {
            const noticesList = response.data.map(notice => ({
                id: notice.id,
                compName, 
                subject: notice.subject,
                message: notice.message,
                image: notice.image,
                file: notice.file,
                type: notice.type,
                timeAgo: notice.timeAgo,
            }));

            renderNotices(noticesList);
        } else {
            renderNotices([]);
        }
    } catch (error) {
        console.error('Error fetching notices:', error);
        alert('Error fetching notices.');
    }
}


async function fetchCompNameFromSession() {
    try {
        const response = await $.ajax({
            url: '/admin/notices/find', 
            method: 'GET',
        });

        if (response.compName) {
            return response.compName;
        } else {
            console.warn('No company name found for the session compCode.');
            return 'Unknown Company';
        }
    } catch (error) {
        console.error('Error fetching company name from session:', error);
        return 'Unknown Company';
    }
}



function renderNotices(notices) {
    const noticesList = document.querySelector('.list-group');
    noticesList.innerHTML = ''; 

    if (notices.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('list-group-item', 'text-center', 'text-muted');
        emptyMessage.textContent = 'No Message has been received.';
        noticesList.appendChild(emptyMessage);
        return;
    }

    notices.forEach(notice => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'flex-column', 'align-items-start');
        listItem.setAttribute('data-id', notice.id);
        listItem.setAttribute('data-subject', notice.subject);
        listItem.setAttribute('data-message', notice.message);
        listItem.setAttribute('data-type', notice.type);
        listItem.setAttribute('data-image', notice.image); 
        listItem.setAttribute('data-file', notice.file); 
        listItem.setAttribute('data-timeago', notice.timeAgo); 
        listItem.setAttribute('data-noticeCount', notice.noticeCount); 
        listItem.onclick = function() { openModal(listItem); };

        // Row for type and time
        const row = document.createElement('div');
        row.classList.add('d-flex', 'justify-content-between', 'w-100');

        // Type badge
        const badgeType = document.createElement('span');
        badgeType.classList.add('badge', 'rounded-pill');

        // Determine badge color based on type
        const badgeColor = getBadgeColor(notice.type);

        badgeType.classList.add(badgeColor);
        badgeType.textContent = notice.type;

        // Time badge
        const badgeTime = document.createElement('span');
        badgeTime.classList.add('badge', 'rounded-pill');

        const timeAgo = notice.timeAgo.toLowerCase();
        const badgeTimeColor = getTimeBadgeColor(timeAgo);
        badgeTime.classList.add(badgeTimeColor);
        badgeTime.textContent = timeAgo;

        // Append badges to row
        row.appendChild(badgeType); 
        row.appendChild(badgeTime);

        // Subject text
        const subjectText = document.createElement('div');
        subjectText.classList.add('mt-2');
        subjectText.textContent = notice.subject;

        // Append row and subject to list item
        listItem.appendChild(row);
        listItem.appendChild(subjectText);

        // Append the list item to the list
        noticesList.appendChild(listItem);
    });
}

function getBadgeColor(type) {
    switch (type) {
        case 'General':
            return 'bg-success';
        case 'Urgent':
            return 'bg-danger';
        case 'Important':
            return 'bg-warning';
        case 'Notice':
            return 'bg-info';
        case 'Reminder':
            return 'bg-primary';
        case 'Announcement':
            return 'bg-secondary';
        default:
            return 'bg-light';
    }
}

function getTimeBadgeColor(timeAgo) {
    if (timeAgo.includes('minute') || timeAgo.includes('just now')) {
        return 'bg-primary';
    } else if (timeAgo.includes('hour')) {
        return 'bg-warning';
    } else if (timeAgo.includes('day')) {
        return 'bg-success';
    }
    return 'bg-light';
}

async function openModal(item) {
    const subject = item.getAttribute('data-subject') || 'No Subject';
    const type = item.getAttribute('data-type') || 'General'; 
    const message = item.getAttribute('data-message') || 'No Message';
    const timeAgo = item.getAttribute('data-timeago') || 'Unknown Time';    
    const compName = await fetchCompNameFromSession();
    const image = item.getAttribute('data-image'); 
    const file = item.getAttribute('data-file'); 
    const modalCompanyName = document.getElementById('modalCName');
    if (modalCompanyName) {
        modalCompanyName.textContent = compName;
    } else {
        console.error('#modalCName element not found in DOM.');
    }

    document.getElementById('modalType').textContent = type;
    document.getElementById('modalSubject').textContent = subject;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalTime').textContent = timeAgo;
    const modalImageElement = document.getElementById('modalImage');
    const modalFileElement = document.getElementById('modalFile');

    if (image && image.trim() !== '') {
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/jpeg;base64,${image}`;
        imgElement.alt = "Notice Image";
        imgElement.style.width = "100%";
        imgElement.style.height = "auto";
            modalImageElement.innerHTML = ''; 
        modalImageElement.appendChild(imgElement);
        modalImageElement.style.display = 'block'; 
    } else {
        modalImageElement.innerHTML = '';
        modalImageElement.style.display = 'none'; 
    }
    

    if (file && file.trim() !== '') {
        const fileUrl = `/notices/${file}`; 
        const fileLink = document.createElement('a');
        fileLink.target = '_blank';  // Open in new tab
        fileLink.href = fileUrl;
        fileLink.textContent = 'View File';
        fileLink.classList.add('btn', 'text-white', getBadgeColor(type));
        
        modalFileElement.innerHTML = ''; 
        modalFileElement.appendChild(fileLink);
        modalFileElement.style.display = 'block'; 
    } else {
        modalFileElement.innerHTML = ''; 
        modalFileElement.style.display = 'none'; 
    }


    const modal = document.getElementById('noticeModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalTime = modal.querySelector('.modalTime');

    modalContent.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning', 'bg-primary', 'bg-secondary', 'bg-light');
    modalTime.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning', 'bg-primary', 'bg-secondary', 'bg-light');
    modalContent.classList.add(getBadgeColor(type));
    modalTime.classList.add(getBadgeColor(type));

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

$(document).on('click', '#notif-card-view .list-group-item', function () {
    openModal(this);
});

$(document).ready(function() {
    fetchNotices();
});

$(document).ready(function () {
    // Initialize the DataTable
    let table = $('#notifTable').DataTable({
        paging: false,
        searching: true,
        info: false,
        lengthChange: false,
        order: [[8, 'desc']],
        language: {
            zeroRecords: "No matching records found",
            infoEmpty: "No records available",
            search: "",
            searchPlaceholder: "Search",
        },
        initComplete: function () {
            // Append the search box to #notif-search-area
            let searchBox = $('#notifTable_filter').detach();
            $('#notif-search-area').append(searchBox);
            $('#notifTable_filter label').addClass("w-100");
            $('#notifTable_filter input').addClass("ps-3");

            // let infoBox = $('#notifTable_info').detach();
            // $('#notif-info-area').append(infoBox);
        },
    });

    table.on('draw', function () {
        let tableWrapper = $('#notifTable_wrapper'); // Wrapper div of DataTables
        let zeroRecordsDiv = $('#notif-info-area'); // Your custom div for zeroRecords message
    
        if (table.rows({ search: 'applied' }).data().length === 0) {
            // Show the zeroRecords message with the styled HTML
            zeroRecordsDiv.html(`
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        No Notifications Found
                    </div>
            `).show();
        } else {
            // Hide the zeroRecords message
            zeroRecordsDiv.hide();
        }
    });


    // Render cards for DataTable rows
    function renderCards() {
        let cardContainer = $('#notif-card-view');
        cardContainer.empty(); // Clear previous cards

        let data = table.rows({ search: 'applied' }).data();
        data.each(function (row) {
            let id = row[0];
            let subject = row[1];
            let type = row[2];
            let message = row[3];
            let image = row[4];
            let file = row[5];
            let timeAgo = row[6];
            let badgeColor = getBadgeColor(type);
            let badgeTimeColor = getTimeBadgeColor(timeAgo);

            let card = $(`
                <li class="list-group-item d-flex flex-column align-items-start" 
                    data-id="${id}"
                    data-subject="${subject}"
                    data-type="${type}"
                    data-message="${message}"
                    data-image="${image}"
                    data-file="${file}"
                    data-timeago="${timeAgo}">
                    <div class="d-flex justify-content-between w-100">
                        <span class="badge ${badgeColor} rounded-pill">
                            ${type}
                        </span>
                        <span class="badge ${badgeTimeColor} rounded-pill">${timeAgo}</span>
                    </div>
                    <div class="mt-2">${subject}</div>
                </li>
            `);
            cardContainer.append(card);
        });
    }

    // Initial render of cards
    renderCards();

    // Re-render cards on DataTable events
    table.on('draw', renderCards);
    table.on('search.dt', renderCards); // Trigger on search
});

// CLOSE ALL BACKDROPS
document.getElementById('noticeModal').addEventListener('hidden.bs.modal', () => {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach((backdrop) => backdrop.remove());
});