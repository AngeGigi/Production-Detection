const delmodal = document.getElementById("deleteEmpModal");
const deloverlay = document.getElementById("delOverlay");
const empDelCancel = document.getElementById("empDelCancel");
const empDelConfirm = document.getElementById("empDelConfirm");
const delName = document.getElementById("delName");
const delEmpID = document.getElementById("delEmpID");

async function gotoDeleteModal(employeeId) {
    console.log("Delete button clicked"); // Check if this logs when you click the button
    console.log("Employee ID to delete:", employeeId);

    // Fetch the employee data
    const response = await fetch(`/homepage/employee/${employeeId}`);
    const data = await response.json();
    const employee = data.employees; // Access the employee object

    const fullName = `${employee.fname} ${employee.lname}`;
    // Update modal content
    delName.innerHTML = fullName || "n/a";
    delEmpID.innerHTML = employee.empID;

    // Store the employee ID in the modal for later use
    $("#deleteEmpModal").data("employeeId", employeeId);
    console.log(employeeId);
}

empDelConfirm.addEventListener("click", async () => {
    const employeeId = $("#deleteEmpModal").data("employeeId");
    try {
        const response = await fetch(`/homepage/delete/${employeeId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            alert("Employee Deleted Successfully");
            window.location.href = data.redirect;
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("An error occurred while deleting the employee.");
    }
});
