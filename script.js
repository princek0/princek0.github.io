document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Try to update the date only if the element exists
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        displayLastModifiedDate();
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

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.prev-arrow');
    const nextButton = document.querySelector('.next-arrow');
    let currentIndex = 0;

    function showSlide(index) {
        // Remove active class from all items
        items.forEach(item => item.classList.remove('active'));
        
        // Add active class to current item
        items[index].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
    }

    // Add event listeners to buttons
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // Initialize the carousel
    showSlide(currentIndex);
});

// Function to display the last modified date
function displayLastModifiedDate() {
    // This date should be manually updated when the site content changes
    const lastModified = "03/06/2025"; // Format: DD/MM/YYYY
    
    // Alternative approach: use the document's last modified date (less reliable for local files)
    // Uses the HTML file's last modified date if available
    if (!lastModified) {
        try {
            const lastModifiedDate = new Date(document.lastModified);
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            document.getElementById('current-date').textContent = lastModifiedDate.toLocaleDateString('en-GB', options);
        } catch (e) {
            console.error("Couldn't determine last modified date:", e);
            document.getElementById('current-date').textContent = "Unknown date";
        }
    } else {
        document.getElementById('current-date').textContent = "Last updated: " + lastModified;
    }
} 