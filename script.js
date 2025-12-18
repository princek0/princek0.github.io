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
        
        // Initially close all dropdowns except "About me"
        if (content && content.classList.contains('dropdown-content')) {
            const headerText = header.textContent.trim();
            if (headerText.includes('About me')) {
                // Keep "About me" expanded by adding active class
                content.classList.add('active');
                header.classList.add('active');
            } else {
                // Close all other dropdowns
                content.classList.remove('active');
            }
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
    
    // Initialize unique views counter
    initializeUniqueViewsCounter();
});

// Function to display the last modified date
function displayLastModifiedDate() {
    // This date should be manually updated when the site content changes
    const lastModified = "18/12/2025"; // Format: DD/MM/YYYY
    
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

// Unique Views Counter Functions
const COUNTAPI_NAMESPACE = 'prince-personal-site';
const STORAGE_KEY = 'uniqueViewTimestamp';

// Get the start of the current week (Monday 00:00:00)
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

// Get a unique key for the current week (format: YYYY-MM-DD of Monday)
function getWeekKey() {
    const weekStart = getWeekStart();
    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `unique-views-${year}-${month}-${day}`;
}

// Check if visitor has been counted this week
function hasBeenCountedThisWeek() {
    try {
        const lastCounted = localStorage.getItem(STORAGE_KEY);
        if (!lastCounted) {
            return false;
        }
        
        const lastCountedDate = new Date(parseInt(lastCounted));
        const weekStart = getWeekStart();
        
        return lastCountedDate >= weekStart;
    } catch (e) {
        console.error('Error checking localStorage:', e);
        return false;
    }
}

// Store timestamp of current visit
function storeVisitTimestamp() {
    try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {
        console.error('Error storing timestamp:', e);
    }
}

// Increment counter via CountAPI
async function incrementCounter(weekKey) {
    try {
        const response = await fetch(`https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${weekKey}`);
        const data = await response.json();
        return data.value;
    } catch (e) {
        console.error('Error incrementing counter:', e);
        return null;
    }
}

// Fetch current count from CountAPI
async function getCurrentCount(weekKey) {
    try {
        const response = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${weekKey}`);
        const data = await response.json();
        return data.value || 0;
    } catch (e) {
        console.error('Error fetching count:', e);
        return null;
    }
}

// Display the unique views count
function displayUniqueViewsCount(count) {
    const counterElement = document.getElementById('unique-views-counter');
    if (counterElement && count !== null) {
        counterElement.textContent = `Unique views this week: ${count}`;
    } else if (counterElement) {
        counterElement.textContent = '';
    }
}

// Initialize unique views counter
async function initializeUniqueViewsCounter() {
    const weekKey = getWeekKey();
    
    // First, display the current count (may be stale, but better than nothing)
    const currentCount = await getCurrentCount(weekKey);
    if (currentCount !== null) {
        displayUniqueViewsCount(currentCount);
    }
    
    // Check if this visitor should be counted
    if (!hasBeenCountedThisWeek()) {
        // Increment the counter
        const newCount = await incrementCounter(weekKey);
        if (newCount !== null) {
            displayUniqueViewsCount(newCount);
            storeVisitTimestamp();
        }
    }
} 