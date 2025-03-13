document.addEventListener('DOMContentLoaded', function() {
    // Display current date
    updateCurrentDate();
    
    // Initialize all dropdowns closed by default
    const dropdownHeaders = document.querySelectorAll('.dropdown-header');
    
    dropdownHeaders.forEach(header => {
        const content = header.nextElementSibling;
        if (content && content.classList.contains('dropdown-content')) {
            content.classList.remove('active');
        }
        
        header.addEventListener('click', function() {
            // Toggle active class on header
            this.classList.toggle('active');
            
            // Toggle content visibility
            const content = this.nextElementSibling;
            if (content && content.classList.contains('dropdown-content')) {
                content.classList.toggle('active');
            }
        });
    });
});

// Function to update the date display
function updateCurrentDate() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-GB', options);
    document.getElementById('current-date').textContent = formattedDate;
} 