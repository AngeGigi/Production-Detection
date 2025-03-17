// Common references for the modal
const dbID = document.getElementById("dbid");
const employeeIdDisplay = document.getElementById("employeeId");
const firstNameInput = document.getElementById("firstName");
const middleNameInput = document.getElementById("middleName");
const lastNameInput = document.getElementById("lastName");
const employeeDepartmentInput = document.getElementById("employeeDepartment");
const employeeEmailInput = document.getElementById("employeeEmail");
const employeeLocAssignInput = document.getElementById("employeeLocAssign");
const employeePicElement = document.getElementById("employeeImage");

// Common function to populate modal with employee data
async function fetchAndPopulateEmployeeData(Id) {
    try {
        const response = await fetch(`/homepage/employee/${Id}`);
        const data = await response.json();

        const employee = data.employees; // Access the employee object
        const locations = data.locations || []; // Ensure locations exist
        // Update modal content
        dbID.value = employee.id;
        employeeIdDisplay.value = employee.empID || "n/a";
        firstNameInput.value = employee.fname || "";
        middleNameInput.value = employee.mname || "";
        lastNameInput.value = employee.lname || "";
        employeeDepartmentInput.value = employee.dept || "n/a";
        employeeEmailInput.value = employee.email || "n/a";

        // Set the selected location in the dropdown by matching loc_assign with location.id
        if (locations.length > 0) {
            const assignedLocationId = employee.loc_assign; // Employee's assigned location ID
            const locationToSelect = locations.find(
                (loc) => loc.id === assignedLocationId
            ); // Find location by ID

            console.log("Location to select:", locationToSelect);

            // If location found, select it; otherwise, set default
            employeeLocAssignInput.value = locationToSelect
                ? locationToSelect.name
                : "n/a";
        }

        // Set the employee image or default
        employeePicElement.src = employee.empPic
            ? `data:image/jpeg;base64,${employee.empPic}`
            : "/pics/default-pic.jpg";
    } catch (error) {
        console.error("Error fetching employee data:", error);
    }
}

function fetchEmployeeDetailsByIndex(index) {
    console.log(`Fetching details for Card #${index + 1}`);
    // Perform fetch or modal operations

    // Event listener for card view
    if (document.querySelector("#empCardEdit")) {
        document
            .querySelector("#empCardEdit")
            .addEventListener("click", function (event) {
                const card = event.target.closest(".card");
                if (card) {
                    let id = card.getAttribute("data-id");
                    let empID = card.getAttribute("data-name");

                    // If no data-id, use index
                    if (!id) {
                        console.log(`No data-id found, using empID: ${empID}`);
                        id = empID; // Use empID if data-id is not available
                    } else {
                        console.log(`Card data-id: ${id}`);
                    }

                    fetchAndPopulateEmployeeData(id); // Fetch and populate modal with employee data
                }
            });
    }
}

// Event listener for list view
if (document.querySelector("#employeeTableBody")) {
    document
        .querySelector("#employeeTableBody")
        .addEventListener("click", function (event) {
            const editButton = event.target.closest("button");
            if (editButton && editButton.classList.contains("edit-emp-btn")) {
                const row = editButton.closest("tr");
                const Id = row.getAttribute("data-id");
                fetchAndPopulateEmployeeData(Id); // Fetch and populate modal with employee data
            }
        });
}

// Ensure to reattach the event listeners after any dynamic update
document.addEventListener("DOMContentLoaded", attachCardEventListener);

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("editEmployee");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const currentView = params.get("view") || "card"; // Get the 'view' parameter
        console.log(currentView);

        // Get the employee ID from the hidden input
        const dbid = document.getElementById("dbid").value;
        console.log(dbid);

        // Retrieve the form values
        const empID = document.getElementById("employeeId").value;
        const fname = document.getElementById("firstName").value;
        const mname = document.getElementById("middleName").value;
        const lname = document.getElementById("lastName").value;
        const dept = document.getElementById("employeeDepartment").value;
        const email = document.getElementById("employeeEmail").value;
        const loc_assign = document.getElementById("employeeLocAssign").value;

        try {
            // Send the update request to the server
            const response = await fetch(`/homepage/edit-employee/${dbid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    empID,
                    fname,
                    mname,
                    lname,
                    dept,
                    email,
                    loc_assign,
                }),
            });

            // Check if the response is ok
            if (!response.ok) {
                const errorText = await response.text(); // Use `.text()` to get raw response data
                console.error(
                    `Server error: ${response.status} - ${response.statusText}`
                );
                console.error(`Error response text: ${errorText}`);
                throw new Error(
                    `Failed to update employee: ${response.statusText}`
                );
            }
            // If successful, alert and redirect to homepage
            alert("Employee updated successfully!");

            // Redirect to the appropriate view based on the currentView variable
            if (currentView === "list") {
                window.location.href = "/homepage?view=list";
            } else if (currentView === "card") {
                window.location.href = "/homepage?view=card";
            }
        } catch (error) {
            console.error("Error updating employee:", error.message);
            alert("Error updating employee. Please try again.");
        }
    });
});

function handleEmployeeStat(buttonText) {
    console.log(buttonText);
    if (buttonText === "Active") {
        employeeStatus.style.backgroundColor = "green";
    } else if (buttonText === "Inactive") {
        employeeStatus.style.backgroundColor = "red";
    } else {
        // Handle other possible status values (optional)
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const employeeDepartmentInput = document.getElementById("employeeDepartment");
    const editDeptList = document.getElementById("editDeptList");
    const compCode = document.getElementById("compCode").value;

    try {
        const response = await fetch(`/homepage/departments?compCode=${compCode}`);
        const departments = await response.json();

        function updateDropdown(filteredDepts = []) {
            editDeptList.innerHTML = '';

            filteredDepts.forEach(deptObj => {
                const li = document.createElement("li");
                li.textContent = deptObj.dept || deptObj.departmentName;
                li.classList.add("dropdown-item");
                li.addEventListener("click", () => {
                    employeeDepartmentInput.value = deptObj.dept || deptObj.departmentName;
                    editDeptList.innerHTML = '';
                });
                editDeptList.appendChild(li);
            });

            if (filteredDepts.length === 0 && employeeDepartmentInput.value.trim() !== "") {
                const newDeptOption = document.createElement("li");
                newDeptOption.textContent = `Add "${employeeDepartmentInput.value.trim()}" as a new department`;
                newDeptOption.classList.add("dropdown-item", "text-primary");
                newDeptOption.addEventListener("click", () => {
                    employeeDepartmentInput.value = employeeDepartmentInput.value.trim();
                    editDeptList.innerHTML = '';
                });
                editDeptList.appendChild(newDeptOption);
            }
        }

        updateDropdown(departments);

        employeeDepartmentInput.addEventListener("input", () => {
            const filter = employeeDepartmentInput.value.toUpperCase();
            const filteredDepts = departments.filter(deptObj =>
                (deptObj.dept || deptObj.departmentName).toUpperCase().includes(filter)
            );

            updateDropdown(filteredDepts);
        });

    } catch (error) {
        console.error("Error fetching departments for editing:", error);
    }
});
