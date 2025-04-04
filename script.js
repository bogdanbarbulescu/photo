// script.js (or within <script> tags in gallery.html)
// Combines all features: Navbar, Image Protection, Smooth Scroll, Scrollspy,
// Gallery Filter, Gallery Modal Carousel (Buttons, Keyboard, Swipe), Fullscreen

/**
 * Executes code when the DOM is fully loaded and parsed.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const SCROLL_OFFSET_BUFFER = 50; // Extra pixels buffer for scrollspy activation
    const SWIPE_THRESHOLD = 50;      // Min horizontal pixels for swipe gesture detection

    // --- Cache Selectors ---
    // Cache frequently accessed elements to avoid repeated lookups
    const mainNav = document.getElementById('mainNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    // Modal Elements (Cache them if the modal exists)
    const galleryModalElement = document.getElementById('galleryModal');
    let modalInstance = null; // To hold the Bootstrap Modal instance
    let modalImageElement = null;
    let modalTitleElement = null;
    let modalCaptionElement = null;
    let modalPrevButton = null;
    let modalNextButton = null;
    let modalFullscreenBtn = null; // Fullscreen button selector

    if (galleryModalElement) {
         modalInstance = new bootstrap.Modal(galleryModalElement); // Initialize BS Modal
         modalImageElement = document.getElementById('modalImage');
         modalTitleElement = document.getElementById('modalTitle');
         modalCaptionElement = document.getElementById('modalCaption');
         modalPrevButton = document.getElementById('modalPrev');
         modalNextButton = document.getElementById('modalNext');
         modalFullscreenBtn = document.getElementById('modalFullscreenBtn'); // Cache the fullscreen button
    }

    // --- Gallery Data & State ---
    let galleryData = []; // Array to hold data for all gallery items
    let currentImageIndex = 0; // Index of the image currently shown in the modal
    let touchStartX = 0;       // Touch start X coordinate for swipe
    let touchEndX = 0;         // Touch end X coordinate for swipe

    // --- Initialize Features ---
    if (mainNav) {
        initNavbarShrink(mainNav);
    }
    initImageProtection(); // Initialize image protection (right-click disable)
    initSmoothScroll(mainNav); // Initialize smooth scrolling for on-page links
    initScrollspy(mainNav, SCROLL_OFFSET_BUFFER); // Initialize scrollspy (may not be active on all pages)
    initGalleryFilter(); // Initialize gallery filtering buttons (only runs if elements exist)
    initGalleryModal(); // Initialize the gallery modal functionality (only runs if elements exist)

    // --- Global Listener for Fullscreen Change ---
    // Needs to be added outside initGalleryModal as it applies to the document
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Prefixes
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);


    // --- Feature Functions ---

    /**
     * Handles shrinking the navbar on scroll.
     * @param {HTMLElement} navElement - The main navigation element.
     */
    function initNavbarShrink(navElement) {
        const shrink = () => {
            if (!navElement) return;
            if (window.pageYOffset === 0) {
                navElement.classList.remove('navbar-scrolled');
            } else {
                navElement.classList.add('navbar-scrolled');
            }
        };
        shrink(); // Run on load
        document.addEventListener('scroll', shrink); // Run on scroll
    }

    /**
     * Disables right-click context menu on specified images.
     */
    function initImageProtection() {
        // Target images more specifically if possible, e.g., within portfolio or article content
        const protectedImages = document.querySelectorAll('img'); // Selects all images

        protectedImages.forEach(img => {
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            // Optional: Style prevent dragging
            img.style.userDrag = 'none';
            img.style.webkitUserDrag = 'none';
        });
    }

    /**
     * Initializes smooth scrolling for anchor links pointing within the current page.
     * Also handles closing the mobile navbar if open.
     * @param {HTMLElement} navElement - The main navigation element (used for height calculation).
     */
    function initSmoothScroll(navElement) {
        document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                // Check if it's truly an ID selector and not just "#"
                if (targetId.length <= 1) return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) { // Only act if the target exists on this page
                    e.preventDefault();

                    const navbarHeight = navElement ? navElement.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = window.pageYOffset + elementPosition - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile navbar if open and toggler exists
                    if (navbarCollapse && navbarCollapse.classList.contains('show') && navbarToggler) {
                        navbarToggler.click();
                    }
                }
            });
        });
    }

    /**
     * Activates navigation links based on scroll position (Scrollspy).
     * @param {HTMLElement} navElement - The main navigation element (for height calculation).
     * @param {number} offsetBuffer - Additional pixel offset for activation.
     */
    function initScrollspy(navElement, offsetBuffer) {
        const sections = document.querySelectorAll('main section[id]'); // Target sections in main with an ID
        const navLinks = document.querySelectorAll('#navbarNav .nav-link[href^="#"]'); // Only target in-page nav links

        if (sections.length === 0 || navLinks.length === 0) return; // Exit if no sections or links to spy on

        const updateActiveLink = () => {
            const scrollY = window.pageYOffset;
            const navHeight = navElement ? navElement.offsetHeight : 70; // Use cached nav or fallback
            let currentSectionId = null; // Use null to indicate no section is currently active

            sections.forEach(section => {
                // Calculate section boundaries with offset
                const sectionTop = section.offsetTop - navHeight - offsetBuffer;
                const sectionBottom = sectionTop + section.offsetHeight;

                // Check if current scroll position is within this section's boundaries
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            // Update active class on nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkHref = link.getAttribute('href');
                if (linkHref !== '#' && linkHref === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });

            // Special handling for the top of the page (only on index.html)
            const pageTopElement = document.getElementById('page-top');
            if (!currentSectionId && pageTopElement && sections.length > 0 && scrollY < sections[0].offsetTop - navHeight - offsetBuffer) {
                 navLinks.forEach(link => link.classList.remove('active'));
            }
        };

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Initial check on page load
    }

    /**
     * Initializes the filtering functionality for the portfolio gallery.
     */
    function initGalleryFilter() {
        const filterContainer = document.querySelector('#gallery-filters');
        const galleryItems = document.querySelectorAll('.portfolio-container .portfolio-item');

        if (!filterContainer || galleryItems.length === 0) {
            return; // Exit if elements aren't found
        }

        // Ensure .hide-item CSS rule exists: .hide-item { display: none !important; }

        filterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                const clickedButton = event.target;
                filterContainer.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active-filter'));
                clickedButton.classList.add('active-filter');
                const filterValue = clickedButton.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.classList.remove('hide-item');
                    } else {
                        item.classList.add('hide-item');
                    }
                });
            }
        });
         // Ensure initial state matches active filter
         const initialActiveFilter = filterContainer.querySelector('.filter-button.active-filter');
         if (initialActiveFilter && initialActiveFilter.getAttribute('data-filter') !== 'all') {
             const initialFilterValue = initialActiveFilter.getAttribute('data-filter');
             galleryItems.forEach(item => {
                 if (!item.classList.contains(initialFilterValue)) {
                     item.classList.add('hide-item');
                 }
             });
         }
    }

    /**
     * Initializes the modal carousel for the gallery, including swipe and fullscreen.
     */
    function initGalleryModal() {
        // Check if all necessary modal elements are present
        if (!galleryModalElement || !modalInstance || !modalImageElement || !modalPrevButton || !modalNextButton || !modalFullscreenBtn) {
            console.warn("One or more modal elements missing, skipping modal initialization.");
            return;
        }

        const portfolioBoxes = document.querySelectorAll('.portfolio-container .portfolio-box');
        galleryData = []; // Reset gallery data array

        // Populate gallery data and attach listeners to portfolio items
        portfolioBoxes.forEach((box, index) => {
            galleryData.push({
                largeSrc: box.getAttribute('data-large-src') || box.href, // Fallback to href
                title: box.getAttribute('data-title') || 'Image',
                category: box.getAttribute('data-category') || ''
                // thumbSrc: box.querySelector('img')?.src // Could store thumbnail if needed
            });
            box.setAttribute('data-index', index); // Store index on the element

            box.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                currentImageIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                updateModalContent(currentImageIndex);
                modalInstance.show(); // Show the Bootstrap modal
            });
        });

        // Attach listeners for modal controls
        modalPrevButton.addEventListener('click', showPreviousImage);
        modalNextButton.addEventListener('click', showNextImage);
        modalFullscreenBtn.addEventListener('click', toggleFullscreen);

        // Keyboard navigation within the modal
        galleryModalElement.addEventListener('keydown', (e) => {
             if (galleryModalElement.classList.contains('show')) { // Only when modal is visible
                if (e.key === 'ArrowLeft') showPreviousImage();
                else if (e.key === 'ArrowRight') showNextImage();
                else if (e.key === 'f' || e.key === 'F') toggleFullscreen(); // Optional: 'f' key for fullscreen
            }
         });

         // Mobile Swipe Navigation Listeners (attach to the image element)
         modalImageElement.addEventListener('touchstart', handleTouchStart, { passive: true }); // Use passive where possible
         modalImageElement.addEventListener('touchmove', handleTouchMove, { passive: false }); // Prevent scroll during potential swipe
         modalImageElement.addEventListener('touchend', handleTouchEnd, false);

         // Update fullscreen button state when modal is shown/hidden
         galleryModalElement.addEventListener('shown.bs.modal', updateFullscreenButtonIcon);
         galleryModalElement.addEventListener('hidden.bs.modal', () => {
             // Ensure we exit fullscreen if modal is closed while image is fullscreen
             if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                exitFullscreen();
             }
             updateFullscreenButtonIcon(); // Reset icon
         });
    }

    /**
     * Updates the content of the modal based on the provided image index.
     * @param {number} index - The index in the galleryData array.
     */
    function updateModalContent(index) {
        if (index < 0 || index >= galleryData.length || !modalImageElement) {
            console.error("Invalid index or modal element missing for update.");
            return;
        }
        const data = galleryData[index];
        // TODO: Consider adding loading state/spinner here
        modalImageElement.src = data.largeSrc;
        modalImageElement.alt = data.title;
        if (modalTitleElement) modalTitleElement.textContent = data.title;
        if (modalCaptionElement) modalCaptionElement.textContent = data.category;
    }

    /**
     * Calculates and shows the previous image in the modal carousel.
     */
    function showPreviousImage() {
         currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length; // Loop safely
         updateModalContent(currentImageIndex);
    }

    /**
     * Calculates and shows the next image in the modal carousel.
     */
    function showNextImage() {
         currentImageIndex = (currentImageIndex + 1) % galleryData.length; // Loop safely
         updateModalContent(currentImageIndex);
    }

    // --- Swipe Gesture Handlers ---
    function handleTouchStart(evt) {
        touchStartX = evt.changedTouches[0].clientX;
        touchEndX = touchStartX; // Reset endX at start
    }

    function handleTouchMove(evt) {
        touchEndX = evt.changedTouches[0].clientX;
        // Optional: Add vertical swipe detection to prevent default page scroll
        // if horizontal movement is dominant. For simplicity, handled basic here.
        // Could check Math.abs(deltaX) > Math.abs(deltaY) here.
    }

    function handleTouchEnd(evt) {
        if (touchStartX === 0) return; // Avoid triggering if touch didn't start properly

        const deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) { // Check if swipe distance is significant
            if (deltaX < 0) { // Swipe Left
                showNextImage();
            } else { // Swipe Right
                showPreviousImage();
            }
        }

        // Reset touch coordinates
        touchStartX = 0;
        touchEndX = 0;
    }

    // --- Fullscreen Functions ---

    /**
     * Requests fullscreen for the target element (modal image).
     */
    function enterFullscreen() {
        const elementToFullscreen = modalImageElement; // Target the image
         if (!elementToFullscreen) return;

        try {
            if (elementToFullscreen.requestFullscreen) {
                elementToFullscreen.requestFullscreen();
            } else if (elementToFullscreen.webkitRequestFullscreen) { /* Safari */
                elementToFullscreen.webkitRequestFullscreen();
            } else if (elementToFullscreen.mozRequestFullScreen) { /* Firefox */
                elementToFullscreen.mozRequestFullScreen();
            } else if (elementToFullscreen.msRequestFullscreen) { /* IE/Edge */
                elementToFullscreen.msRequestFullscreen();
            } else {
                 console.warn("Fullscreen API is not supported by this browser.");
            }
        } catch (err) {
             console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        }
    }

     /**
     * Exits fullscreen mode.
     */
    function exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        } catch (err) {
             console.error(`Error attempting to disable full-screen mode: ${err.message} (${err.name})`);
        }
    }

    /**
     * Toggles fullscreen mode for the modal image.
     */
    function toggleFullscreen() {
         if (!document.fullscreenElement && // Standard
             !document.webkitFullscreenElement && // Safari/Chrome
             !document.mozFullScreenElement && // Firefox
             !document.msFullscreenElement) { // IE/Edge
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }

    /**
     * Updates the fullscreen button icon based on the current fullscreen state.
     */
    function updateFullscreenButtonIcon() {
        if (!modalFullscreenBtn) return;
        const icon = modalFullscreenBtn.querySelector('i');
        if (!icon) return;

        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress'); // Change to exit icon
            modalFullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
        } else {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand'); // Change back to enter icon
            modalFullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
        }
    }

    /**
     * Handles changes in fullscreen state (e.g., user pressing Esc).
     */
    function handleFullscreenChange() {
        // Simply update the button icon whenever the state changes
        updateFullscreenButtonIcon();
    }


}); // End DOMContentLoaded