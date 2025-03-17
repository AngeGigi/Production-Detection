document.getElementById('collapseBtn').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebarContent');
    const icon = this.querySelector('i');

    // Toggle the 'collapsed' class on the sidebar
    sidebar.classList.toggle('collapsed');

    // Apply rotation to the icon based on the collapse state
    if (sidebar.classList.contains('collapsed')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const submenuToggles = document.querySelectorAll('.toggle-submenu');

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior

            const target = document.querySelector(this.getAttribute('data-bs-target'));

            if (target) {
                // Check if the submenu is already open
                const isExpanded = target.classList.contains('show');

                // Close all submenus (optional: for accordion-like behavior)
                document.querySelectorAll('.submenu').forEach(submenu => {
                    if (submenu !== target) {
                        submenu.classList.remove('show');
                        submenu.style.maxHeight = null;
                    }
                });

                // Reset all chevron icons
                document.querySelectorAll('.fas.fa-chevron-down').forEach(chevron => {
                    chevron.classList.remove('rotate-180');
                });

                if (isExpanded) {
                    // Collapse submenu
                    target.classList.remove('show');
                    const chevron = this.querySelector('.submenu-arrow');
                    if (chevron) {
                        chevron.classList.add('rotate-180');
                    }
                    target.style.maxHeight = null;
                } else {
                    // Expand submenu
                    target.classList.add('show');
                    target.style.maxHeight = target.scrollHeight + "px"; // Set height dynamically
                }
            }

            // Rotate the chevron icon
            const chevron = this.querySelector('.fas.fa-chevron-down');
            if (chevron) {
                chevron.classList.toggle('rotate-180');
            }
        });
    });

    // Close submenu when clicking outside
    document.addEventListener('click', function (event) {
        // Check if the clicked element is inside a submenu or toggle
        const isInsideSubmenu = event.target.closest('.submenu') || event.target.closest('.toggle-submenu');

        if (!isInsideSubmenu) {
            // Close all open submenus
            document.querySelectorAll('.submenu.show').forEach(submenu => {
                submenu.classList.remove('show');
                submenu.style.maxHeight = null;
            });

            // Reset all chevron icons
            document.querySelectorAll('.fas.fa-chevron-down').forEach(chevron => {
                chevron.classList.remove('rotate-180');
            });
        }
    });
});


// Check if dark mode preference is saved in localStorage
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Set initial theme based on localStorage or default to light mode
if (localStorage.getItem('darkMode') === 'true') {
    body.setAttribute('data-bs-theme', 'dark');
    darkModeToggle.checked = true;
} else {
    body.setAttribute('data-bs-theme', 'light');
    darkModeToggle.checked = false;
}

// Add event listener to toggle dark mode on checkbox change
darkModeToggle.addEventListener('change', function () {
    console.log('Dark mode toggled:', this.checked); // Check if this log appears on smaller screens
    if (this.checked) {
        body.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        body.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('darkMode', 'false');
    }
});

