// Function to export data to CSV CARD
function exportToCardCSV() {
    const rows = [];

    // Define headers for the CSV file
    const headers = [
        "Full Name",
        "Employee ID",
        "Activity",
        "Time",
        "Address",
        "Latitude",
        "Longitude"
    ];
    rows.push(headers.join(","));

    // Loop through all rows in the DataTable (not just the current page)
    const table = $('#dtrsTable').DataTable();
    const allData = table.rows({ search: 'applied' }).data();  // Get all rows, including those on hidden pages

    if (allData.length === 0) {
        alert("No records found to export.");
        return;
    }

    allData.each(function(row) {
        let act = row[1];
        let img = row[2];
        let time = row[3] || 'Not Checked In';
        let empID = row[4];
        let fullName = row[5];
        let lat = row[6];
        let long = row[7];
        let address = row[8] || 'No Address Provided';

        // Format the row data for CSV
        const cols = [
            fullName,
            empID,
            act,
            time,
            `"${address}"`, // Wrap address in quotes to handle commas
            lat,
            long
        ];
        rows.push(cols.join(","));
    });

    if (rows.length > 1) {
        const csvString = rows.join("\n");

        // Create a blob and trigger the download
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "daily_time_records.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("No data available for export.");
    }
}

// Attach click event to the export button
document
    .getElementById("exportCardCsvBtn")
    .addEventListener("click", exportToCardCSV);
