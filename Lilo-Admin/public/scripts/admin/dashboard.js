setInterval(function () {
    const currentTime = moment().format('h:mm:ss A');
    document.getElementById('current-time').textContent = currentTime;
}, 1000);

const dailyButton = document.getElementById('showDaily');
const daily = document.getElementById('dailyDataContainer');
const weeklyButton = document.getElementById('showWeekly');
const weekly = document.getElementById('weeklyDataContainer');
    
        dailyButton.addEventListener('click', () => {
            daily.classList.toggle('show');
            weekly.classList.toggle('show');
            daily.classList.toggle('active');
            weekly.classList.toggle('active');
            
            dailyButton.classList.add('btn-primary');
            dailyButton.classList.remove('btn-secondary');
            weeklyButton.classList.add('btn-secondary');
            weeklyButton.classList.remove('btn-primary');
        });

        weeklyButton.addEventListener('click', () => {
            daily.classList.toggle('show');
            weekly.classList.toggle('show');
            daily.classList.toggle('active');
            weekly.classList.toggle('active');

            weeklyButton.classList.add('btn-primary');
            weeklyButton.classList.remove('btn-secondary');
            dailyButton.classList.add('btn-secondary');
            dailyButton.classList.remove('btn-primary');
        });

        const adjustMap = document.getElementById('adjustMap');
        const adjustContainer = document.getElementById('adjustContainer');
    
        adjustMap.addEventListener('click', () => {
            adjustContainer.classList.toggle('col-xl-3');
            adjustContainer.classList.toggle('col-xl-8');
            adjustContainer.style.height('400px');
        });

// Convert time (hh:mm:ss AM/PM) to fractional hours
function convertTimeToFraction(timeStr) {
    const [time, ampm] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    let totalHours = hours + minutes / 60 + seconds / 3600;
    if (ampm === 'PM' && hours !== 12) totalHours += 12;
    if (ampm === 'AM' && hours === 12) totalHours -= 12;
    return totalHours;
}

// Convert seconds to hh:mm:ss AM/PM format
function convertSecondsToTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const secs = date.getUTCSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = secs < 10 ? '0' + secs : secs;
    return `${hours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
}

// Extract login data for the chart
function extractLoginData() {
    const rows = document.querySelectorAll('.login-data-table tbody tr');
    const labels = [];
    const countIn = [];
    const countOut = [];
    const earliestTime = [];
    const latestOutTime = [];
    const avgLogin = [];
    const avgLogout = [];

    rows.forEach(row => {
        const date = row.cells[0].textContent.trim();
        labels.push(date);
        countIn.push(parseInt(row.cells[1].textContent.trim(), 10));
        countOut.push(parseInt(row.cells[2].textContent.trim(), 10));
        earliestTime.push(row.cells[3].textContent.trim());
        latestOutTime.push(row.cells[4].textContent.trim());
        avgLogin.push(row.cells[5].textContent.trim());
        avgLogout.push(row.cells[6].textContent.trim());
    });

    return { labels, countIn, countOut, earliestTime, latestOutTime, avgLogin, avgLogout };
}

// Generate login chart
function generateLoginChart() {
    const loginData = extractLoginData();
    const ctx = document.getElementById('loginsChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: loginData.labels,
            datasets: [
                {
                    label: 'Count IN',
                    data: loginData.countIn,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                },
                {
                    label: 'Count OUT',
                    data: loginData.countOut,
                    backgroundColor: 'rgba(220, 53, 69, 0.6)',
                },
                {
                    type: 'line',
                    label: 'Earliest Time',
                    data: loginData.earliestTime.map(convertTimeToFraction),
                    borderColor: '#ffc107',
                    fill: false,
                    yAxisID: 'y-time',
                },
                {
                    type: 'line',
                    label: 'Latest Out Time',
                    data: loginData.latestOutTime.map(convertTimeToFraction),
                    borderColor: '#28a745',
                    fill: false,
                    yAxisID: 'y-time',
                },
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                'y-time': {
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Time (Hours)'
                    },
                    ticks: {
                        callback: function (value) {
                            const hours = Math.floor(value);
                            const minutes = Math.round((value - hours) * 60);
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHour = hours % 12 || 12;
                            return `${displayHour}:${minutes === 0 ? '00' : minutes} ${ampm}`;
                        }
                    }
                }
            }
        }
    });
}

// Extract daily data for the chart
function extractDailyData() {
    const rows = document.querySelectorAll('.daily-data-table tbody tr');
    const labels = [];
    const timeIn = [];

    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(1)').textContent.trim();
        const time = row.querySelector('td:nth-child(2)').textContent.trim();
        labels.push(name);
        timeIn.push(convertTimeToFraction(time));
    });

    return { labels, timeIn };
}

// Generate daily chart
function generateDailyChart() {
    const { labels, timeIn } = extractDailyData();
    const ctx = document.getElementById('dailyChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Time In',
                data: timeIn,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Employee Name'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time In'
                    },
                    ticks: {
                        callback: function (value) {
                            const hours = Math.floor(value);
                            const minutes = Math.round((value - hours) * 60);
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            const displayHour = hours % 12 || 12;
                            return `${displayHour}:${minutes === 0 ? '00' : minutes} ${ampm}`;
                        }
                    }
                }
            }
        }
    });
}

function generateMap(){
    console.log("mappppp");
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

        $("#startTable_filter").appendTo("#search-sod1").find("input");
        $("#startTable_filter").addClass("d-flex justify-content-end");
        $("#startTable_length").appendTo("#display-sod1");
        $("#startTable_length label").addClass("d-flex align-items-center");
        $("#startTable_length select").addClass("w-25 ms-2");
        $("#startTable_paginate").detach().appendTo("#paginate-sod1");

        $(document).ready(function() {
            // Initialize the map
            const startmap = L.map('startmap').setView([15.5, 120.9], 7);
    
            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 15,
                attribution: '© OpenStreetMap contributors',
            }).addTo(startmap);
    
            const Records = JSON.parse('<%= Records %>');  // Parse the JSON string passed from the backend

            console.log(Records);   // Check the object structure

    // Now, you can safely use `forEach`
    if (Array.isArray(Records)) {
        Records.forEach(record => {
            console.log(record);  // Do your processing here
        });
    } else {
        console.log('Records is not an array');
    }
    
            // Function to apply jitter to the marker position
            function getJitteredPosition(lat, long) {
                const jitter = 0.1; // Adjust as needed
                return [
                    lat + (Math.random() - 0.5) * jitter,
                    long + (Math.random() - 0.5) * jitter
                ];
            }
    
            // Loop through each employee record
            Records.forEach(emp => {
                if (emp.lat && emp.long && emp.img && emp.img !== 'gg') {
                    const [jitteredLat, jitteredLng] = getJitteredPosition(emp.lat, emp.long);
    
                    const customIcon = L.divIcon({
                        className: 'custom-icon-wrapper',
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
    
                    const marker = L.marker([jitteredLat, jitteredLng], { icon: customIcon })
                        .bindPopup(`${emp.fname} ${emp.mname ? emp.mname + ' ' : ''}${emp.lname}`);
    
                    marker.addTo(startmap);
                } else {
                    console.warn(`Skipping marker for ${emp.empID} due to missing or invalid lat, long, or img.`);
                }
            });
        });
    });

}

window.onload = function () {
    generateLoginChart();
    generateDailyChart();    
    generateMap();
};
