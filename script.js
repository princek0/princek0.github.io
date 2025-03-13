document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Try to update the date only if the element exists
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        updateCurrentDate();
    }
    
    // Initialize all dropdowns closed by default
    const dropdownHeaders = document.querySelectorAll('.dropdown-header');
    console.log('Found dropdown headers:', dropdownHeaders.length);
    
    dropdownHeaders.forEach(header => {
        console.log('Processing header:', header.textContent.trim());
        const content = header.nextElementSibling;
        
        // Initially close all dropdowns
        if (content && content.classList.contains('dropdown-content')) {
            content.classList.remove('active');
        }
        
        // Add click event listener to all headers
        header.addEventListener('click', function(e) {
            console.log('Header clicked:', this.textContent.trim());
            // Toggle active class on header
            this.classList.toggle('active');
            
            // Toggle content visibility
            const content = this.nextElementSibling;
            if (content && content.classList.contains('dropdown-content')) {
                content.classList.toggle('active');
                console.log('Toggled dropdown content');
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