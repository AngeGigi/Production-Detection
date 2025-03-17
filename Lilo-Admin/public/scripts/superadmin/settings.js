const userManageBtn = document.getElementById('user-management-tab');
const userManage = document.getElementById('user-management-settings');
const profileSettingsBtn = document.getElementById('profile-settings-tab');
const profileSettings = document.getElementById('profile-settings');
        const profileSettingsForm = document.getElementById('profile-settings-form');
        const settingserrorMessagesContainer = document.getElementById('errorMessages');
    
        userManageBtn.addEventListener('click', () => {
            userManage.classList.toggle('d-none');
            profileSettings.classList.toggle('d-none');
        });

        profileSettingsBtn.addEventListener('click', () => {
            userManage.classList.toggle('d-none');
            profileSettings.classList.toggle('d-none');
            fetch('/superadmin/profile')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('username').value = data.username || '';
                    })
                    .catch(err => {
                        console.error('Error fetching profile:', err);
                        settingserrorMessagesContainer.innerHTML = '<p class="error-message">Unable to fetch profile details.</p>';
                    });
        });
    
        $('#profileForm').on('submit', function (e) {
            e.preventDefault();
    
            const username = $('#username').val();
            const password = $('#password').val();
            const confirmPassword = $('#confirmPassword').val();
    
            if (password !== confirmPassword) {
                settingserrorMessagesContainer.innerHTML = '<p class="error-message">Passwords do not match.</p>';
                return;
            }
    
            const formData = { username, password };
    
            $.ajax({
                url: '/superadmin/profile/update',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: () => {
                    alert('Profile updated successfully.');
    
                    $('#password').val('');
                    $('#confirmPassword').val('');
    
                    profileSettingsForm.style.display = 'none';
                },
                error: (err) => {
                    const errors = err.responseJSON.errors || ['An error occurred while updating the profile.'];
                    settingserrorMessagesContainer.innerHTML = errors.map(error => `<p class="error-message">${error}</p>`).join('');
                }
            });
        });