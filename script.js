// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Shrink Function ---
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        const navbarShrink = function () {
            if (!mainNav) return;
            // Use pageYOffset for broader compatibility
            if (window.pageYOffset === 0) {
                mainNav.classList.remove('navbar-scrolled');
            } else {
                mainNav.classList.add('navbar-scrolled');
            }
        };
        navbarShrink(); // Run on load
        document.addEventListener('scroll', navbarShrink); // Run on scroll
    }

    // --- Disable Right-Click on Images ---
    // Select all images you want to protect. You might want to be more specific
    // e.g., document.querySelectorAll('.portfolio-box img, #about img')
    const protectedImages = document.querySelectorAll('img');

    protectedImages.forEach(img => {
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Stop the default context menu
            // Optional: Show a message, but this can be annoying
            // alert('Image downloading is disabled.');
        });

        // Optional: Add CSS to prevent dragging (less effective)
        img.style.userDrag = 'none';
        img.style.webkitUserDrag = 'none'; // For older Webkit browsers

    });

    // Optional: Disable right-click on the entire page body
    // document.body.addEventListener('contextmenu', (e) => {
    //    e.preventDefault();
    // });

    // --- Smooth Scrolling for In-Page Links ---
    // Select links that point to IDs *on the current page*
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) { // Only act if the target exists on this page
                e.preventDefault();
                const navbarHeight = mainNav ? mainNav.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = window.pageYOffset + elementPosition - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Close mobile navbar if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const toggler = document.querySelector('.navbar-toggler');
                    if (toggler) toggler.click();
                }
            }
        });
    });

    // --- Activate scrollspy for sections ON THE CURRENT PAGE ---
    const sections = document.querySelectorAll('main section[id]'); // Target sections in main
    const navLinks = document.querySelectorAll('#navbarNav .nav-link[href^="#"]'); // Only target in-page nav links

    function updateActiveNavLinkOnScroll() {
        if (sections.length === 0 || navLinks.length === 0) return; // Only run if sections/links exist

        let currentSectionId = '';
        const scrollY = window.pageYOffset;
        const navHeight = mainNav ? mainNav.offsetHeight : 70;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current section ID
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        // Handle page top if needed (only relevant on index.html)
        if (document.body.contains(document.getElementById('page-top'))) { // Check if on index page
            const homeBrandLink = document.querySelector('.navbar-brand[href="#page-top"]');
            if (!currentSectionId && scrollY < sections[0].offsetTop - navHeight - 50 && homeBrandLink) {
                navLinks.forEach(link => link.classList.remove('active'));
            }
        }
    }
    // Only add scroll listener if there are sections to spy on
    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveNavLinkOnScroll);
        updateActiveNavLinkOnScroll(); // Initial check
    }


    // --- Gallery Filtering Logic ---
    const filterContainer = document.querySelector('#gallery-filters');
    const galleryItems = document.querySelectorAll('.portfolio-container .portfolio-item');

    if (filterContainer && galleryItems.length > 0) {
        filterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                // Remove active class from all buttons
                filterContainer.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('active-filter');
                });
                // Add active class to the clicked button
                event.target.classList.add('active-filter');

                const filterValue = event.target.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        // Show item - remove hide class if used, or set display
                        item.classList.remove('hide-item');
                        item.style.display = 'block'; // Or 'inline-block' etc. based on layout needs
                    } else {
                        // Hide item - add hide class if used, or set display
                        item.classList.add('hide-item');
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    // --- REMOVED Contact Form AJAX Submission Logic ---

}); // End DOMContentLoaded
