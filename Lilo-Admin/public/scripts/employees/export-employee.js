//export CARD
function exportToEmpCardCSV() {
    const table = $("#employeesTable").DataTable();  // Reference to the DataTable instance

    // Check if there are any records
    if (table.data().count() === 0) {
        alert("No records available for export.");
        return;
    }

    const rows = [];

    // Define headers for the employee data CSV
    const headers = ["Full Name", "Employee ID", "Department", "Email"];
    rows.push(headers.join(","));

    // Collect data from all rows in the DataTable
    table.rows().every(function () {
        const rowData = this.data();  // Get the data for the row

        const fullName = rowData[1];  // Full Name (column 1)
        const empID = rowData[2];  // Employee ID (column 2)
        const department = rowData[3];  // Department (column 3)
        const email = rowData[4];  // Email (column 4)

        // Combine all data into a single row
        const cols = [fullName, empID, department, email];
        rows.push(cols.join(","));
    });

    if (rows.length > 1) {
        const csvString = rows.join("\n");

        // Create a blob and trigger the download
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "employee_data.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("No data available for export.");
    }
}


//export LIST
function exportToEmpListCSV() {
    const table = $("#employeeTable").DataTable();
    console.log("export button for list view");

    // Check if there are any records
    if (table.data().count() === 0) {
        alert("No records available for export.");
        return;
    }

    const rows = [];

    // Define headers
    const headers = [
        "No.",
        "Full Name",
        "Employee ID",
        "Department",
        "Email",
        "Location Assignment",
        "Registration Status",
        "Employee Status",
    ];
    rows.push(headers.join(","));

    table.rows().every(function () {
        const rowData = this.node();

        const row = [
            wrapInQuotes($(rowData).find("td:nth-child(1)").text().trim()), // No.
            wrapInQuotes($(rowData).find("td:nth-child(2)").text().trim()), // Full Name
            wrapInQuotes($(rowData).find("td:nth-child(3)").text().trim()), // Employee ID
            wrapInQuotes($(rowData).find("td:nth-child(4)").text().trim()), // Department
            wrapInQuotes($(rowData).find("td:nth-child(5)").text().trim()), // Email
            wrapInQuotes($(rowData).find("td:nth-child(6)").text().trim()), // Location Assignment
            wrapInQuotes($(rowData).find("td:nth-child(7)").text().trim()), // Registration Status
            wrapInQuotes(
                $(rowData).find(".empStatBtn").data("tooltip") ||  // Get from data-tooltip attribute
                $(rowData).find(".currentStat").val() ||           // Get from hidden input field
                'N/A'  // Default value if both are empty
            ),
        ];

        rows.push(row.join(","));
    });

    // Create a CSV file and trigger download
    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employee_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to wrap text in quotes if it contains commas
function wrapInQuotes(text) {
    if (text.includes(",")) {
        return `"${text}"`;
    }
    return text;
}

// Event listener for the Export button
// Event listener for the Export button
document.addEventListener("DOMContentLoaded", function () {
    const exportEmpCardCsvBtn = document.getElementById("exportEmpCardCsvBtn");
    const exportButton = document.getElementById("exportButton");

    if (exportEmpCardCsvBtn) {
        console.log("Card export button is available.");
        exportEmpCardCsvBtn.addEventListener("click", exportToEmpCardCSV);
    } else if (exportButton) {
        console.log("List export button is available.");
        exportButton.addEventListener("click", exportToEmpListCSV);
    } else {
        console.log("No export buttons are available.");
    }
});

