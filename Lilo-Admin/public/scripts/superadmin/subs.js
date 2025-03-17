$('#createAdminModal').on('submit', '#form', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get input elements
    const compcode_input = document.getElementById("companycode-input");
    const user_input = document.getElementById("user-input");
    const email_input = document.getElementById("user-email");
    const password_input = document.getElementById("password-input");
    const repeat_password_input = document.getElementById("repeat-password-input");
    const error_message = document.getElementById("errorMessages");

    // Clear previous error states
    clearErrorStates();

    // Validate registration form inputs
    const errors = getSignupFormErrors(
        compcode_input.value,
        user_input.value,
        email_input.value,
        password_input.value,
        repeat_password_input.value
    );

    if (errors.length > 0) {
        // Display errors and prevent submission
        displayErrors(errors);
    } else {
        // Submit form via AJAX
        const formData = {
            compCode: compcode_input.value,
            username: user_input.value,
            email: email_input.value,
            password: password_input.value,
        };

        $.post('/admin/register', formData)
            .done(function (response) {
                // Handle success (e.g., close modal and show success message)
                $('#createAdminModal').modal('hide');
                alert('Admin created successfully!');
                $('#form')[0].reset();
            })
            .fail(function (error) {
                // Handle error (e.g., display server error message)
                displayErrors([error.responseText || "An error occurred. Please try again."]);
            });
    }
});

// Helper functions for form validation
function getSignupFormErrors(compCode, username, email, password, repeatPassword) {
    const errors = [];

    if (!compCode) errors.push("Company Code is required");
    if (!username) errors.push("Username is required");
    if (!email) errors.push("Email is required");
    if (!validateEmail(email)) errors.push("Invalid email format");
    if (!password) errors.push("Password is required");
    if (password.length < 8) errors.push("Password must have at least 8 characters");
    if (password !== repeatPassword) errors.push("Passwords do not match");

    return errors;
}

function displayErrors(errors) {
    const error_message = document.getElementById("errorMessages");
    error_message.classList.remove("d-none");
    error_message.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
}

function clearErrorStates() {
    const error_message = document.getElementById("errorMessages");
    error_message.classList.add("d-none");
    error_message.innerHTML = "";
}

// Email validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


// Functionality for compVer checkboxes
$("input[name='compVer']").on('change', function () {
    const allCheckbox = $("input[name='compVer'][value='All']");
    const homeCheckbox = $("input[name='compVer'][value='Home']");
    const officeCheckbox = $("input[name='compVer'][value='Office']");

    if ($(this).val() === 'All' && $(this).is(':checked')) {
        homeCheckbox.prop('checked', true);
        officeCheckbox.prop('checked', true);
    } else if (homeCheckbox.is(':checked') && officeCheckbox.is(':checked')) {
        allCheckbox.prop('checked', true);
    } else {
        allCheckbox.prop('checked', false);
    }
});

// Functionality for compFeat checkboxes
$("input[name='compFeat']").on('change', function () {
    const allCheckbox = $("input[name='compFeat'][value='All']");
    const gpsCheckbox = $("input[name='compFeat'][value='GPS']");
    const extendedUserCheckbox = $("input[name='compFeat'][value='Extended user']");
    const apiLogCheckbox = $("input[name='compFeat'][value='API Log']");
    const locationTrackingCheckbox = $("input[name='compFeat'][value='Location Tracking']");

    if ($(this).val() === 'All' && $(this).is(':checked')) {
        gpsCheckbox.prop('checked', true);
        extendedUserCheckbox.prop('checked', true);
        apiLogCheckbox.prop('checked', true);
        locationTrackingCheckbox.prop('checked', true);
    } else if (
        gpsCheckbox.is(':checked') &&
        extendedUserCheckbox.is(':checked') &&
        apiLogCheckbox.is(':checked') &&
        locationTrackingCheckbox.is(':checked')
    ) {
        allCheckbox.prop('checked', true);
    } else {
        allCheckbox.prop('checked', false);
    }
});

// Form submission with validation
$('#registerCompanyForm').on('submit', function (e) {
    e.preventDefault();
    const errors = [];
    if (!$('#compUser').val()) errors.push('Username is required.');
    if (!$('#compEmail').val() || !validateEmail($('#compEmail').val())) {
        errors.push('Valid email is required.');
    }

    if (errors.length) {
        const errorMessagesContainer = $('#errorMessages');
        errorMessagesContainer.empty();
        errors.forEach((error) => {
            errorMessagesContainer.append(`<p class="error-message">${error}</p>`);
        });
        return;
    }

    // Collect the form data
    const formData = {
        compUser: $('#compUser').val(),
        compName: $('#compName').val(),
        compEmail: $('#compEmail').val(),
        compAddress: $('#compAddress').val(),
        compCountEmp: $('#compCountEmp').val(),
        compNum: $('#compNum').val(),
        subType: $('#subType').val(),
        compExp: $('#compExp').val(),
        compVer: $("input[name='compVer']:checked").map(function () {
            return this.value === 'All' ? 'All' : this.value; // Collect all selected values
        }).get(), 
        
        compFeat: $("input[name='compFeat']:checked").map(function () {
            return this.value === 'All' ? 'All' : this.value;
        }).get(),
    };

    $.post('/superadmin/register-company', formData)
        .done(() => {
            alert('Company registered successfully!');
            $('#registerCompanyForm')[0].reset();
            $("input[name='compVer']").prop('checked', false);
            $("input[name='compFeat']").prop('checked', false);
            $('#regCompanyModal').modal('hide');
        })
        .fail((err) => {
            const errors = err.responseJSON.errors;
            const errorMessagesContainer = $('#errorMessages');
            errorMessagesContainer.empty();
            errors.forEach(error => {
                errorMessagesContainer.append(`<p class="error-message">${error}</p>`);
            });
            errorMessagesContainer[0].scrollIntoView({ behavior: 'smooth' });
        });
});

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function fetchCompCodes() {
    try {
        const response = await fetch('/superadmin/notice/compCodes');
        const data = await response.json();

        if (data.compCodes && Array.isArray(data.compCodes)) {
            const compCodeCheckboxes = document.getElementById('compCodeCheckboxes');
            compCodeCheckboxes.innerHTML = '';  // Clear any existing checkboxes

            const allCheckboxDiv = document.createElement('div');
            allCheckboxDiv.classList.add('form-check');

            const allCheckbox = document.createElement('input');
            allCheckbox.classList.add('form-check-input');
            allCheckbox.type = 'checkbox';
            allCheckbox.id = 'allCompCodes';  
            allCheckbox.value = 'all'; 

            const allLabel = document.createElement('label');
            allLabel.classList.add('form-check-label');
            allLabel.textContent = 'All';  

            allCheckboxDiv.appendChild(allCheckbox);
            allCheckboxDiv.appendChild(allLabel);

            compCodeCheckboxes.appendChild(allCheckboxDiv);

            data.compCodes.forEach(compCodeObj => {
                const compCode = compCodeObj.compCode;  // The company code
                const compName = compCodeObj.compName;  // The company name

                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('form-check');

                const checkbox = document.createElement('input');
                checkbox.classList.add('form-check-input');
                checkbox.type = 'checkbox';
                checkbox.name = 'compCode[]';
                checkbox.value = compCode;  // Only send the compCode when submitting the form

                const label = document.createElement('label');
                label.classList.add('form-check-label');
                label.textContent = `${compName} || ${compCode}`;  // Display Name || Code

                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);

                compCodeCheckboxes.appendChild(checkboxDiv);
            });

            const checkboxes = document.querySelectorAll('input[name="compCode[]"]');

            // Toggle check/uncheck all checkboxes
            allCheckbox.addEventListener('change', function () {
                const isChecked = this.checked;
                checkboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
            });
            
            // Ensure the 'All' checkbox reflects the state of the individual checkboxes
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
                    allCheckbox.checked = allChecked;
                });
            });
        } else {
            console.error('No company codes found or invalid data format.');
        }
    } catch (error) {
        console.error('Error fetching company codes:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchCompCodes();
});

$(document).ready(function () {
    let isScheduled = false;  

    $('#scheduleYes').on('click', function () {
        isScheduled = true;
        $('#scheduleTimeDiv').show();  
    });

    $('#scheduleNo').on('click', function () {
        isScheduled = false;
        $('#scheduleTimeDiv').hide();  
    });
   
    function formatTime(datetime) {
        const date = new Date(datetime);
    
        if (isNaN(date)) {
            console.error('Invalid Date: ' + datetime);
            return 'Invalid datetime'; 
        }
    
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0'); 
        const minute = date.getMinutes().toString().padStart(2, '0');
    
        return `${year}-${month}-${day}T${hour}:${minute}+08:00`;
    }
     
    
    $("#createNoticeForm").submit(function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const fileFile = $('#noticeFile')[0].files[0]; 

        const selectedCompCodes = [];
        $('input[name="compCode[]"]:checked').each(function () {
            selectedCompCodes.push($(this).val());
        });
        
        if (selectedCompCodes.length === 0) {
            alert("Please select at least one company code.");
            return;  
        }

        formData.set('compCodes', JSON.stringify(selectedCompCodes)); // Send as a JSON string
        let scheduleTime = null;
        if (isScheduled) {
            const rawScheduleTime = $('#scheduleTime').val(); // Get the raw datetime-local value
            if (!rawScheduleTime) {
                alert("Please select a valid schedule time.");
                return;
            }
    
            // Get current time in Asia/Manila timezone
            const currentDate = new Date();
            const currentManilaTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
            // Convert raw scheduled time to a Date object
            const scheduledDate = new Date(rawScheduleTime);
            
            // Compare scheduled time with the current Manila time
            if (scheduledDate < currentManilaTime) {
                alert("The scheduled time cannot be in the past. Please select a valid future time.");
                return;
            }
    
            scheduleTime = formatTime(rawScheduleTime); 
            formData.set('STime', scheduleTime); 
        }
    
        const imageFile = $('#noticeImage')[0].files[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = function () {
                let base64Image = reader.result;
                base64Image = base64Image.split(',')[1]; 
        
                formData.set('imageBase64', base64Image);
                sendFormData(formData);
            };
            reader.readAsDataURL(imageFile);
        } else {
            formData.set('imageBase64', '');
            sendFormData(formData);
        }
        

        function sendFormData(formData) {

                if (formData.has('image')) {
                    formData.delete('image');
                }
            $("#submitNotice").attr("disabled", true).text("Submitting...");

            $.ajax({
                url: '/superadmin/notice/create',  // Adjust the URL if necessary
                method: 'POST',
                data: formData,
                processData: false,  // Don't process the data
                contentType: false,  // Don't set content type
                success: function (response) {
                    alert(response.message);
                    $("#createNoticeModal").modal('hide');
                      // Clear all fields and uncheck checkboxes
                      $("#createNoticeForm")[0].reset(); // Reset the form fields
                      $('input[name="compCode[]"]').prop('checked', false); // Uncheck checkboxes
                      $('#allCompCodes').prop('checked', false);
                      window.location.reload();
                  },
                error: function (err) {
                    const errorMessages = err.responseJSON.error || 'An unexpected error occurred.';
                    $("#errorMessages").removeClass('d-none').text(errorMessages);
                    $("#submitNotice").attr("disabled", false).text("Submit");
                },
                complete: function () {
                    $("#submitNotice").attr("disabled", false).text("Submit");
                }
            });
        }
    });
});
$(document).ready(function () {
    function fetchNotices() {
        $.ajax({
            url: '/superadmin/allnotices',
            method: 'GET',
            success: function (response) {
                const noticesTableBody = $('#noticesTableBody');
                const noMessagesRow = $('#noMessagesRow');
                const schNoticesTableBody = $('#schNoticesTableBody');
                const noSchNoticesMessage = $('#noSchNoticesMessage');
                const schNoticesTable = $('#schNoticesTable');
 
                if (response.data && Array.isArray(response.data)) {
                    noticesTableBody.empty();
                    noMessagesRow.hide();
 
                    response.data.forEach(notice => {
                        const compCodesFormatted = JSON.parse(notice.compCodes).join(', ');
 
                        const imageSrc = notice.image ? `data:image/jpeg;base64,${notice.image}` : ''; // Re-add the prefix
                        const imageHtml = imageSrc ? `<img src="${imageSrc}" loading="lazy" alt="Notice Image" style="width: 100px; height: auto;">` : 'No image';
 
                        const fileUrl = notice.file ? `/notices/${notice.file}` : '';
                        const fileLink = fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn btn-primary btn-sm">View File</a>` : 'No file';
 
                        const noticeRow = `
                            <tr>
                                <td style="display: none">${notice.id}</td>
                                <td>${notice.subject}</td>
                                <td>${notice.message}</td>
                                <td>${notice.type}</td>
                                <td>${compCodesFormatted}</td>
                                <td style="display: none">${notice.createdAt}</td>
                                <td>${imageHtml}</td>
                                <td>${fileLink}</td>
                            </tr>
                        `;
                        noticesTableBody.append(noticeRow);
                    });
 
                    if ($.fn.dataTable.isDataTable('#noticesTable')) {
                        $('#noticesTable').DataTable().clear().destroy();
                    }
 
                    $('#noticesTable').DataTable({
                        order: [[5, 'desc']],
                        paging: true,
                        searching: true,
                        info: true,
                        lengthChange: false,
                        responsive: true,
                    });
                } else {
                    noMessagesRow.show(); // Show the "No messages" row if there are no notices
                }
 
                if (response.schNotices && Array.isArray(response.schNotices)) {
                    schNoticesTableBody.empty();
 
                    if (response.schNotices.length > 0) {
                        noSchNoticesMessage.hide();
                        schNoticesTable.show();
 
                        response.schNotices.forEach(notice => {
                            const compCodesFormatted = JSON.parse(notice.compCodes).join(', ');
 
                            const imageSrc = notice.image ? `data:image/jpeg;base64,${notice.image}` : '';
                            const imageHtml = imageSrc ? `<img src="${imageSrc}" loading="lazy" alt="Scheduled Notice Image" style="width: 100px; height: auto;">` : 'No image';
 
                            const fileUrl = notice.file ? `/notices/${notice.file}` : '';
                            const fileLink = fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn btn-primary btn-sm">View File</a>` : 'No file';
 
                            const noticeRow = `
                                <tr>
                                    <td style="display: none">${notice.id}</td>
                                    <td>${notice.subject}</td>
                                    <td>${notice.message}</td>
                                    <td>${notice.type}</td>
                                    <td>${compCodesFormatted}</td>
                                    <td>${notice.STime}</td>
                                    <td>${imageHtml}</td>
                                    <td>${fileLink}</td>
                                </tr>
                            `;
                            schNoticesTableBody.append(noticeRow);
                        });
 
                        $('#schNoticesTable').DataTable({
                            order: [[5, 'asc']],
                            columnDefs: [{ orderable: false, targets: [6,7] }],
                            deferRender: true,
                            paging: true,
                            lengthChange: true,
                            searching: true,
                            ordering: true,
                            info: true,
                            autoWidth: false,
                            language: {
                                lengthMenu: "Show _MENU_",
                                zeroRecords: "No matching records found",
                                info: "Showing page _PAGE_ of _PAGES_",
                                infoEmpty: "No records available",
                                infoFiltered: "(filtered from _MAX_ total records)",
                                search: "",
                                searchPlaceholder: "Search Messages",
                                paginate: {
                                    previous: "<<",
                                    next: ">>",
                                },
                            },
                        });

                        // Move the search box to the header
                        $("#schNoticesTable_filter").appendTo(".schNotif-search-area");
                        $("#schNoticesTable_filter label").addClass("w-100");
                        $("#schNoticesTable thead").appendTo("#schNoticesTableHeader");

                        // Move the display records per page dropdown
                        $("#schNoticesTable_length").appendTo(".schNotif-display-no-list");
                        $("#schNoticesTable_length label").addClass("d-flex align-items-center");

                        // Move the pagination controls to the custom div
                        $("#schNoticesTable_paginate")
                            .detach()
                            .appendTo("#schNotifpaginationControls");

                        // Move the info about pages to your custom div
                        $("#schNoticesTable_info").appendTo(".schNotif-page-info");
                        // Update the page info on table redraw (pagination, search, etc.)
                        table.on("draw", function () {
                            $("#schNoticesTable_info").appendTo(".schNotif-page-info");
                        });
                        
                    } else {
                        noSchNoticesMessage.show();
                        schNoticesTable.hide();
                    }
                }
            },
            error: function (err) {
                console.error('Error fetching notices:', err);
                alert('Error fetching notices.');
            },
        });
    }
 
    fetchNotices();
});


