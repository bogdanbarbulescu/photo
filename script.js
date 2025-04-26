// script.js (or within <script> tags)
// Combines Navbar, Image Protection, Smooth Scroll, Scrollspy,
// Gallery Filter, Gallery Modal Carousel (Buttons, Keyboard, Swipe), Native Fullscreen

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
    let modalImageElement = document.getElementById('modalImage'); // Cache image element directly
    let modalTitleElement = null;
    let modalCaptionElement = null;
    let modalPrevButton = null;
    let modalNextButton = null;
    let modalFullscreenBtn = null;

    if (galleryModalElement) {
        // Ensure Bootstrap 5 Modal JS is loaded before this script
        try {
            modalInstance = new bootstrap.Modal(galleryModalElement); // Initialize BS Modal
            // Only cache other modal elements if the modal itself exists
            modalTitleElement = document.getElementById('modalTitle');
            modalCaptionElement = document.getElementById('modalCaption');
            modalPrevButton = document.getElementById('modalPrev');
            modalNextButton = document.getElementById('modalNext');
            modalFullscreenBtn = document.getElementById('modalFullscreenBtn'); // Cache the fullscreen button
        } catch (error) {
            console.error("Error initializing Bootstrap Modal. Make sure Bootstrap's JavaScript is loaded.", error);
            // Prevent further errors by nullifying potentially problematic variables
            galleryModalElement = null;
            modalInstance = null;
            modalImageElement = null; // Image element might exist, but logic depends on modalInstance
        }
    }

    // --- Gallery Data & State ---
    let galleryData = []; // Array to hold data for all gallery items
    let currentImageIndex = 0; // Index of the image currently shown in the modal
    let touchStartX = 0;       // Touch start X coordinate for swipe
    let touchEndX = 0;         // Touch end X coordinate for swipe

    // --- Initialize Features ---
    // Run initializers safely, checking if elements exist where necessary
    if (mainNav) {
        initNavbarShrink(mainNav);
        initSmoothScroll(mainNav); // Smooth scroll depends on nav for height offset
        // Scrollspy also often depends on nav height for offsets
        initScrollspy(mainNav, SCROLL_OFFSET_BUFFER);
    } else {
        // Initialize features that don't strictly depend on mainNav
        initSmoothScroll(null); // Run smooth scroll without offset if nav missing
        initScrollspy(null, SCROLL_OFFSET_BUFFER); // Run scrollspy without offset if nav missing
    }

    initImageProtection(); // Initialize image protection (right-click disable)
    initGalleryFilter(); // Initialize gallery filtering buttons
    initGalleryModal(); // Initialize the gallery modal functionality

    // --- Global Listener for Fullscreen Change ---
    // Handles events like user pressing 'Esc' to exit fullscreen
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Prefixes
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);


    // --- Feature Functions ---

    /**
     * Handles shrinking the navbar on scroll.
     * @param {HTMLElement | null} navElement - The main navigation element.
     */
    function initNavbarShrink(navElement) {
        if (!navElement) return; // Don't run if nav doesn't exist

        const shrink = () => {
            // Double check navElement exists inside the listener function too
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
     * Consider making the selector more specific if needed.
     */
    function initImageProtection() {
        // --- IMPORTANT: Select ONLY the images you want to protect ---
        // Example: Protect only images inside portfolio items
        // const protectedImages = document.querySelectorAll('.portfolio-item img');
        // Or images with a specific class:
        // const protectedImages = document.querySelectorAll('img.protected-image');
        // Using 'img' selects ALL images on the page, which might be too broad.
        const protectedImages = document.querySelectorAll('.portfolio-container img, #modalImage'); // Example: Protect gallery thumbs and modal image

        protectedImages.forEach(img => {
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                console.log("Image right-click prevented."); // Optional feedback
            });
            // Optional: Style to visually suggest dragging isn't intended
            img.style.userDrag = 'none';
            img.style.webkitUserDrag = 'none';
            img.style.pointerEvents = 'none'; // More robust way to prevent dragging/saving sometimes
        });
    }

    /**
     * Initializes smooth scrolling for anchor links pointing within the current page.
     * Also handles closing the mobile navbar if open.
     * @param {HTMLElement | null} navElement - The main navigation element (used for height calculation).
     */
    function initSmoothScroll(navElement) {
        // Select links with href starting with '#' but not just '#'
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                let targetElement;
                try {
                    targetElement = document.querySelector(targetId);
                } catch (error) {
                    console.warn(`Smooth scroll target selector "${targetId}" is invalid or element not found.`, error);
                    return; // Exit if selector is invalid (e.g., starts with number)
                }


                if (targetElement) { // Only act if the target exists on this page
                    e.preventDefault();

                    const navbarHeight = navElement ? navElement.offsetHeight : 0;
                    // Use scrollY for cross-browser compatibility over pageYOffset
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = window.scrollY + elementPosition - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile navbar if open and toggler exists
                    if (navbarCollapse && navbarCollapse.classList.contains('show') && navbarToggler) {
                        // Use Bootstrap 5's JS API to hide the collapse if available
                        const collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse);
                        if (collapseInstance) {
                           collapseInstance.hide();
                        } else {
                            // Fallback if instance not found (less ideal)
                           navbarToggler.click();
                        }
                    }
                }
                // If targetElement is not found, the link will behave normally (potentially navigating away)
            });
        });
    }

    /**
     * Activates navigation links based on scroll position (Scrollspy).
     * @param {HTMLElement | null} navElement - The main navigation element (for height calculation).
     * @param {number} offsetBuffer - Additional pixel offset for activation.
     */
    function initScrollspy(navElement, offsetBuffer) {
        // Target sections within the main content area that have an ID
        const sections = document.querySelectorAll('main section[id], section.page-section[id]'); // Be more specific if possible
        // Target only nav links within the main navbar collapse area that point to page anchors
        const navLinks = document.querySelectorAll('#mainNav .navbar-nav .nav-link[href^="#"]:not([href="#"])');

        if (sections.length === 0 || navLinks.length === 0) {
            // console.log("Scrollspy: No sections or nav links found to spy on.");
            return; // Exit if no sections or links to spy on
        }

        const updateActiveLink = () => {
            const scrollY = window.scrollY;
            // Use a sensible fallback if navElement isn't available
            const navHeight = navElement ? navElement.offsetHeight : 70;
            let currentSectionId = null;

            sections.forEach(section => {
                // Calculate section boundaries precisely
                const sectionTop = section.offsetTop - navHeight - offsetBuffer;
                const sectionBottom = sectionTop + section.offsetHeight;

                // Check if current scroll position is within this section's boundaries
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            });

             // Handle edge case: If scrolled past the last section, make the last link active
            if (!currentSectionId && sections.length > 0 && scrollY >= (sections[sections.length - 1].offsetTop - navHeight - offsetBuffer)) {
                currentSectionId = sections[sections.length - 1].getAttribute('id');
            }

            // Update active class on nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
                 // Ensure the link's href matches the current section ID
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });

             // Special handling for the very top of the page (e.g., highlight "Home")
            // This might need adjustment based on your exact HTML structure and desired behavior
            const homeLink = document.querySelector('#mainNav .navbar-nav .nav-link[href="#page-top"], #mainNav .navbar-nav .nav-link[href="#"]'); // Example selectors
            if (!currentSectionId && scrollY < (sections[0]?.offsetTop - navHeight - offsetBuffer) && homeLink) {
                navLinks.forEach(link => link.classList.remove('active')); // Deactivate others
                homeLink.classList.add('active'); // Activate home link
            } else if (homeLink && homeLink.getAttribute('href') !== `#${currentSectionId}`) {
                // Ensure home link is not active if another section is
                 // homeLink.classList.remove('active'); // This might conflict if home IS the current section
            }
        };

        // Use a throttled scroll listener for performance if needed, otherwise standard listener is ok
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Initial check on page load
    }

    /**
     * Initializes the filtering functionality for the portfolio gallery.
     * Requires filter buttons with `data-filter` attributes and gallery items
     * with corresponding CSS classes (matching the `data-filter` values).
     * Also requires a CSS rule like: `.hide-item { display: none !important; }`
     */
    function initGalleryFilter() {
        const filterContainer = document.querySelector('#gallery-filters');
        // Select items within a specific container to avoid conflicts
        const galleryItems = document.querySelectorAll('.portfolio-container .portfolio-item');

        if (!filterContainer || galleryItems.length === 0) {
            // console.log("Gallery Filter: Filter container or gallery items not found.");
            return; // Exit if elements aren't found
        }

        // Add this CSS rule if it doesn't exist in your CSS:
        // .portfolio-item.hide-item { display: none; } /* Use !important only if necessary */

        filterContainer.addEventListener('click', (event) => {
            // Ensure the click is directly on a button, not the container itself
            if (event.target.matches('.filter-button')) {
                const clickedButton = event.target;

                // Update active state on buttons
                filterContainer.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active-filter'));
                clickedButton.classList.add('active-filter');

                const filterValue = clickedButton.getAttribute('data-filter');

                // Filter items
                galleryItems.forEach(item => {
                    // Check if the item should be shown
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.classList.remove('hide-item');
                    } else {
                        item.classList.add('hide-item');
                    }
                });
            }
        });

         // Ensure initial state matches the default active filter on page load
         const initialActiveFilter = filterContainer.querySelector('.filter-button.active-filter');
         if (initialActiveFilter) {
             const initialFilterValue = initialActiveFilter.getAttribute('data-filter');
             if(initialFilterValue !== 'all') {
                 galleryItems.forEach(item => {
                     if (!item.classList.contains(initialFilterValue)) {
                         item.classList.add('hide-item');
                     }
                 });
             }
         } else {
             // If no button is active by default, assume 'all' or find the 'all' button
             const allButton = filterContainer.querySelector('.filter-button[data-filter="all"]');
             if (allButton) {
                 allButton.classList.add('active-filter');
             }
             // All items are visible by default, no need to hide any initially unless an active filter exists.
         }
    }

    /**
     * Initializes the modal carousel for the gallery, including swipe and fullscreen.
     * Requires a Bootstrap 5 Modal structure in HTML with specific IDs.
     * Relies on `.portfolio-box` elements having `data-large-src`, `data-title`, `data-category`.
     */
    function initGalleryModal() {
        // Check if all necessary modal elements AND the Bootstrap instance are ready
        if (!galleryModalElement || !modalInstance || !modalImageElement || !modalPrevButton || !modalNextButton || !modalFullscreenBtn) {
            // console.warn("Gallery Modal: One or more modal elements missing or Bootstrap Modal failed to initialize. Skipping modal setup.");
            return;
        }

        // Find the container holding the clickable items
        const portfolioContainer = document.querySelector('.portfolio-container');
        if (!portfolioContainer) {
             console.warn("Gallery Modal: Portfolio container not found.");
             return;
        }
        // Select only direct children links/boxes to avoid nested issues
        const portfolioBoxes = portfolioContainer.querySelectorAll(':scope > .portfolio-item > .portfolio-box, :scope > .portfolio-box');

        if (portfolioBoxes.length === 0) {
            console.warn("Gallery Modal: No portfolio boxes found within the container.");
            return;
        }

        galleryData = []; // Reset gallery data array

        // Populate gallery data and attach listeners to portfolio items
        portfolioBoxes.forEach((box, index) => {
            // Extract data, providing fallbacks
            const largeSrc = box.getAttribute('data-large-src') || box.href || '#'; // Fallback to href, then '#'
            const title = box.getAttribute('data-title') || 'Image';
            const category = box.getAttribute('data-category') || ''; // Use data-category if available
            const thumbImg = box.querySelector('img');
            const thumbAlt = thumbImg ? thumbImg.alt : ''; // Get alt text from thumb

            // Store comprehensive data
            galleryData.push({
                largeSrc: largeSrc,
                title: title,
                category: category,
                alt: thumbAlt || title // Use thumb alt text, fallback to title
            });
            box.setAttribute('data-index', index); // Store index on the element for easy retrieval

            box.addEventListener('click', (e) => {
                 // Check if the clicked item is currently visible (not filtered out)
                 const parentItem = box.closest('.portfolio-item');
                 if (parentItem && parentItem.classList.contains('hide-item')) {
                     return; // Do nothing if the item is hidden by the filter
                 }

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
             // Check if the modal is actually visible using Bootstrap's state
             if (galleryModalElement.classList.contains('show')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault(); // Prevent browser back navigation
                    showPreviousImage();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault(); // Prevent default scroll/behavior
                    showNextImage();
                } else if (e.key === 'Escape') {
                    // Bootstrap handles Esc by default, but we ensure fullscreen is exited
                    if (isElementFullscreen(modalImageElement)) {
                         exitFullscreen();
                    }
                    // Allow Bootstrap to close the modal
                }
                // Removed 'f' key binding as it might conflict with browser find; button is clearer
            }
         });

         // Mobile Swipe Navigation Listeners (attach to the image element for better targeting)
         modalImageElement.addEventListener('touchstart', handleTouchStart, { passive: true });
         // Use passive:false on move ONLY if you intend to preventDefault scroll during swipe detection
         modalImageElement.addEventListener('touchmove', handleTouchMove, { passive: true }); // Let browser handle scroll unless needed
         modalImageElement.addEventListener('touchend', handleTouchEnd, false);

         // Update fullscreen button state when modal is shown/hidden
         galleryModalElement.addEventListener('shown.bs.modal', updateFullscreenButtonIcon);
         galleryModalElement.addEventListener('hidden.bs.modal', () => {
             // Ensure we exit fullscreen if modal is closed while image is fullscreen
             if (isElementFullscreen(modalImageElement)) {
                exitFullscreen();
             }
             updateFullscreenButtonIcon(); // Reset icon when modal is hidden
         });
    }

    /**
     * Updates the content (image, title, caption) of the modal.
     * @param {number} index - The index in the galleryData array.
     */
    function updateModalContent(index) {
        if (index < 0 || index >= galleryData.length || !modalImageElement) {
            console.error("Modal Update: Invalid index or modal image element missing.");
            return;
        }
        const data = galleryData[index];

        // Optional: Show a loading indicator before changing src
        // modalImageElement.style.opacity = '0.5'; // Example

        modalImageElement.src = data.largeSrc;
        modalImageElement.alt = data.alt || data.title; // Use specific alt text if available

        // Check if title/caption elements exist before trying to set textContent
        if (modalTitleElement) modalTitleElement.textContent = data.title;
        if (modalCaptionElement) modalCaptionElement.textContent = data.category;

        // Optional: Hide loading indicator once image loads
        // modalImageElement.onload = () => { modalImageElement.style.opacity = '1'; };
        // modalImageElement.onerror = () => { /* Handle image loading error */ };

        // Update fullscreen button state just in case
        updateFullscreenButtonIcon();
    }

    /**
     * Calculates and shows the previous image in the modal carousel.
     */
    function showPreviousImage() {
         if (galleryData.length === 0) return;
         currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length; // Loop safely
         updateModalContent(currentImageIndex);
    }

    /**
     * Calculates and shows the next image in the modal carousel.
     */
    function showNextImage() {
         if (galleryData.length === 0) return;
         currentImageIndex = (currentImageIndex + 1) % galleryData.length; // Loop safely
         updateModalContent(currentImageIndex);
    }

    // --- Swipe Gesture Handlers ---
    function handleTouchStart(evt) {
        // Use the first changed touch
        touchStartX = evt.changedTouches[0].clientX;
        touchEndX = touchStartX; // Reset endX at start
    }

    function handleTouchMove(evt) {
        // Update endX continuously during move
        touchEndX = evt.changedTouches[0].clientX;
        // If using passive:false, you could add logic here to preventDefault
        // if the swipe is primarily horizontal, to stop page scrolling.
        // e.g., const deltaY = evt.changedTouches[0].clientY - touchStartY;
        // if (Math.abs(touchEndX - touchStartX) > Math.abs(deltaY)) evt.preventDefault();
    }

    function handleTouchEnd(evt) {
        if (touchStartX === 0 || touchEndX === 0) return; // Avoid triggering if touch didn't move properly

        const deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) { // Check if swipe distance is significant
            if (deltaX < 0) { // Swipe Left (finger moved left) -> Next Image
                showNextImage();
            } else { // Swipe Right (finger moved right) -> Previous Image
                showPreviousImage();
            }
        }

        // Reset touch coordinates regardless of swipe outcome
        touchStartX = 0;
        touchEndX = 0;
    }

    // --- Fullscreen Functions ---

    /** Checks if the browser is currently in fullscreen mode OR a specific element is */
    function isFullscreen() {
         return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    }
    /** Checks if a specific element is the one in fullscreen */
    function isElementFullscreen(el) {
         return (document.fullscreenElement === el || document.webkitFullscreenElement === el || document.mozFullScreenElement === el || document.msFullscreenElement === el);
    }

    /**
     * Requests fullscreen for the modal image element.
     */
    function enterFullscreen() {
        // Target the image specifically for fullscreen
        const elementToFullscreen = modalImageElement;
         if (!elementToFullscreen) {
            console.error("Cannot enter fullscreen: Modal image element not found.");
            return;
         }

        try {
            // Use Promise-based API where available for better feedback
            const promise = elementToFullscreen.requestFullscreen?.()
                || elementToFullscreen.webkitRequestFullscreen?.()
                || elementToFullscreen.mozRequestFullScreen?.()
                || elementToFullscreen.msRequestFullscreen?.();

            if (promise instanceof Promise) {
                promise.catch(err => {
                     console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else if (promise === undefined && !isFullscreen()) {
                // Fallback check for older browsers or if no promise returned
                 console.warn("Fullscreen API might not be supported or request method unavailable.");
            }
        } catch (err) {
             console.error(`Exception attempting to enable full-screen mode: ${err.message} (${err.name})`);
        }
    }

     /**
     * Exits fullscreen mode.
     */
    function exitFullscreen() {
        if (!isFullscreen()) return; // Don't try to exit if not in fullscreen

        try {
             const promise = document.exitFullscreen?.()
                || document.webkitExitFullscreen?.()
                || document.mozCancelFullScreen?.()
                || document.msExitFullscreen?.();

             if (promise instanceof Promise) {
                promise.catch(err => {
                     console.error(`Error attempting to disable full-screen mode: ${err.message} (${err.name})`);
                });
            }
        } catch (err) {
             console.error(`Exception attempting to disable full-screen mode: ${err.message} (${err.name})`);
        }
    }

    /**
     * Toggles fullscreen mode for the modal image.
     */
    function toggleFullscreen() {
         if (!modalImageElement) return; // Need the image to make it fullscreen

         if (!isElementFullscreen(modalImageElement)) { // If image isn't already fullscreen
            enterFullscreen();
        } else { // If image (or anything else) is fullscreen
            exitFullscreen();
        }
    }

    /**
     * Updates the fullscreen button icon (e.g., expand/compress)
     * based on whether the modal image is currently fullscreen.
     */
    function updateFullscreenButtonIcon() {
        if (!modalFullscreenBtn) return;
        const icon = modalFullscreenBtn.querySelector('i'); // Assumes Font Awesome <i> tag
        if (!icon) return;

        // Check specifically if the *modal image* is fullscreen
        if (isElementFullscreen(modalImageElement)) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            modalFullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
            modalFullscreenBtn.title = 'Exit fullscreen'; // Tooltip
        } else {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            modalFullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
            modalFullscreenBtn.title = 'Enter fullscreen'; // Tooltip
        }
    }

    /**
     * Handles the browser's fullscreenchange event (e.g., user pressing Esc).
     */
    function handleFullscreenChange() {
        // Simply update the button icon to reflect the new state
        updateFullscreenButtonIcon();

        // Optional: Add class to modal body when image is fullscreen for styling hooks
        if (galleryModalElement) {
            if (isElementFullscreen(modalImageElement)) {
                galleryModalElement.classList.add('image-is-fullscreen');
            } else {
                galleryModalElement.classList.remove('image-is-fullscreen');
            }
        }
    }

}); // End DOMContentLoaded Listener