
            $(document).ready(function() {
                // Initialize DataTables
                $('#startTable').DataTable({
                    columnDefs: [
        { targets: [5, 6, 7], visible: false }  // Hide columns by index (zero-based)
    ],
                    paging: true,
                    searching: true,
                    ordering: true,
                    language: {
                        lengthMenu: "Show _MENU_",
                        zeroRecords: "No matching employees found",
                        info: "",
                        infoEmpty: "No employees available",
                        infoFiltered: "",
                        search: "",
                        searchPlaceholder: "Search", // Your custom placeholder
                        paginate: {
                            previous: "<<",
                            next: ">>",
                        },
                    },
                });
                
                $("#startTable_filter")
                    .appendTo("#search-sod1")
                    .find("input");
                $("#startTable_length").appendTo("#display-sod1");
                $("#startTable_paginate")
                    .detach()
                    .appendTo("#paginate-sod1");
                
                $('#notLoggedInTable').DataTable({
                    columnDefs: [
        { targets: [6, 7, 8], visible: false }  //, Hide columns by index (zero-based)
    ],
                    paging: true,
                    searching: true,
                    ordering: true,
                    language: {
                        lengthMenu: "Show _MENU_",
                        zeroRecords: "No matching employees found",
                        info: "",
                        infoEmpty: "No employees available",
                        infoFiltered: "",
                        search: "",
                        searchPlaceholder: "Search", // Your custom placeholder
                        paginate: {
                            previous: "<<",
                            next: ">>",
                        },
                    },
                });
                $("#notLoggedInTable_filter")
                    .appendTo("#search-sod2")
                    .find("input");
                $("#notLoggedInTable_length").appendTo("#display-sod2");
                $("#notLoggedInTable_paginate")
                    .detach()
                    .appendTo("#paginate-sod2");
                
                // Show the current date for the start of day reports
                document.getElementById('currentDate').innerText = new Date().toLocaleDateString();
                
                // Show the current date for the not logged in reports
                document.getElementById('currentNotLoggedInDate').innerText = new Date().toLocaleDateString();
                
            const startmap = L.map('startmap').setView([15.5, 120.9], 7);
        
                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 15,
                    attribution: '© OpenStreetMap contributors',
                }).addTo(startmap);

            const startRecords = <%- JSON.stringify(startRecords) %>;
            function getJitteredPosition(lat, long) {
                const jitter = 0.1; // Adjust this value as needed
                return [
                    lat + (Math.random() - 0.5) * jitter,
                    long + (Math.random() - 0.5) * jitter
                ];
            }

            startRecords.forEach(emp => {
                if (emp.lat && emp.long && emp.img) {
                // Get a jittered position
                const [jitteredLat, jitteredLng] = getJitteredPosition(emp.lat, emp.long);

                var customIcon = L.divIcon({
                    className: 'custom-icon-wrapper', // Use the wrapper for positioning
                    html: `
                        <div class="custom-icon">
                            <img src="data:image/jpeg;base64,${emp.img}" alt="Marker Icon">
                        </div>
                        <div class="custom-triangle"></div>
                    `,
                    iconSize: [50, 75],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -50]
                });

                var marker = L.marker([jitteredLat, jitteredLng], { icon: customIcon })
                .bindPopup(`${emp.fname} ${emp.mname ? emp.mname + ' ' : ''}${emp.lname}`);
                
                marker.addTo(startmap);
            }
            });

            const notLoggedInMap = L.map('notLoggedInMap').setView([15.5, 120.9], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 15,
    attribution: '© OpenStreetMap contributors',
}).addTo(notLoggedInMap);

const notRecords = <%- JSON.stringify(notRecords) %>;

function getJitteredPosition(latitude, longitude) {
    const jitter = 0.1; // Adjust this value as needed
    return [
        latitude + (Math.random() - 0.5) * jitter,
        longitude + (Math.random() - 0.5) * jitter
    ];
}

// Add markers for not logged-in records
notRecords.forEach(emp => {
    if (emp.latitude && emp.longitude && emp.img) {
        // Get a jittered position
        const [jitteredLat, jitteredLng] = getJitteredPosition(emp.latitude, emp.longitude);

        // Create the custom icon with image and triangle
        var notcustomIcon = L.divIcon({
            className: 'custom-icon-wrapper', // Use the wrapper for positioning
            html: `
                <div class="custom-icon">
                    <img src="data:image/jpeg;base64,${emp.img}" alt="Marker Icon">
                </div>
                <div class="custom-triangle"></div>
            `,
            iconSize: [50, 75], // Adjust height to accommodate the triangle
            iconAnchor: [25, 50], // Adjust anchor point to center on the circular icon
            popupAnchor: [0, -50]
        });

        var marker = L.marker([jitteredLat, jitteredLng], { icon: notcustomIcon }) // Use the correct variable name
            .bindPopup(`${emp.fname} ${emp.mname ? emp.mname + ' ' : ''}${emp.lname}`);

        marker.addTo(notLoggedInMap);
    }
});



            // notRecords.forEach(emp => {
            //     if (emp.latitude && emp.longitude) {
            //         // Create a custom icon using the employee's image
            //         const iconUrl = emp.img ? `data:image/jpeg;base64,${emp.img}` : '../pics/default-pic.jpg'; // Correctly defining the iconUrl variable

            //         const notCustomIcon = L.icon({
            //             className: 'custom-icon',
            //             iconUrl: iconUrl,
            //             iconSize: [100, 100], // Size of the icon [width, height]
            //             iconAnchor: [25, 50], // Adjust anchor point to center the icon
            //             popupAnchor: [0, -40], // Adjust popup position
            //         });

            //         L.marker([emp.latitude, emp.longitude], { icon: notCustomIcon })
            //             .addTo(notLoggedInMap)
            //             .bindPopup(`${emp.fname} ${emp.mname ? emp.mname + ' ' : ''}${emp.lname}`);
            //     }
            // });
            });
