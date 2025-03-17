document.addEventListener("DOMContentLoaded", function () {
    const batchmodal = document.getElementById("batch-modal");
    const batchoverlay = document.getElementById("batch-modal-overlay");
    const fabBatchButton = document.getElementById("batch");
    const csvFileInput = document.getElementById("csvFile");
    const importButton = document.getElementById("importButton");
    const downloadButton = document.getElementById("downloadTemplate");

    // Download template function
    if (downloadButton) {
        downloadButton.addEventListener("click", function () {
            const headers = [
                "empID",
                "fname",
                "lname",
                "dept",
                "email",
                "loc_assign",
                "regStat",
                "empStat",
            ];

            // Create CSV content
            const csvContent =
                "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "employee_template.csv");

            // Append link to body, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Import CSV and save to database

    if (importButton) {
        importButton.addEventListener("click", async function () {
            const file = csvFileInput.files[0];
            if (!file) {
                alert("Please select a file to upload.");
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true, // This will automatically skip empty lines
                complete: async function (results) {
                    const employees = results.data
                        .map((row) => {
                            // Check if essential fields exist and skip rows where they're missing
                            if (
                                !row["empID"] ||
                                !row["fname"] ||
                                !row["lname"] ||
                                !row["dept"]
                            ) {
                                return null; // Return null for invalid rows
                            }

                            return {
                                empID: row["empID"]?.trim() || null,
                                fname: row["fname"]?.trim() || null,
                                lname: row["lname"]?.trim() || null,
                                dept: row["dept"]?.trim() || null,
                                email: row["email"]?.trim() || null,
                                loc_assign: row["loc_assign"]?.trim() || null,
                                regStat:
                                    row["regStat"]?.trim() || "Pre-registered",
                                empStat: row["empStat"]?.trim() || "Inactive",
                            };
                        })
                        .filter(Boolean); // Filter out null (invalid) entries

                    if (employees.length === 0) {
                        alert("No valid employee data found.");
                        return;
                    }

                    console.log("Mapped Employees:", employees);

                    try {
                        const response = await fetch(
                            "/homepage/import-employees",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(employees),
                            }
                        );

                        if (!response.ok) {
                            const errorData = await response.json();
                            if (errorData.message === "Duplicate empID") {
                                alert(
                                    `Employee ID ${errorData.empID} already exists.`
                                );
                                return;
                            }
                            throw new Error("Network response was not ok");
                        }

                        const data = await response.json();
                        console.log("Success:", data);
                        alert("Employees imported successfully!");

                        window.location.reload();
                    } catch (error) {
                        console.error("Error importing employees:", error);
                        alert("Error importing employees.");
                    }
                },
            });
        });
    }
});
