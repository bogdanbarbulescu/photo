// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Shrink Function ---
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        const navbarShrink = function () {
            if (!mainNav) {
                return;
            }
            if (window.scrollY === 0) {
                mainNav.classList.remove('navbar-scrolled');
            } else {
                mainNav.classList.add('navbar-scrolled');
            }
        };

        // Shrink the navbar
        navbarShrink();

        // Shrink the navbar when page is scrolled
        document.addEventListener('scroll', navbarShrink);
    }


    // --- Smooth Scrolling for Navbar Links ---
    const navLinks = document.querySelectorAll('#navbarNav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Check if it's an internal link within the page
            if (targetId && targetId.startsWith('#') && targetId.length > 1 && document.querySelector(targetId)) {
                e.preventDefault(); // Prevent default anchor jump

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Recalculate navbar height *at the time of click*
                    const navbarHeight = mainNav ? mainNav.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    // Adjust scroll position precisely
                    const offsetPosition = window.pageYOffset + elementPosition - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile navbar if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const toggler = document.querySelector('.navbar-toggler');
                        if (toggler) {
                           toggler.click(); // Simulate click to close
                        }
                    }

                    // // Basic active link update (the scroll handler below is better)
                    // navLinks.forEach(l => l.classList.remove('active'));
                    // this.classList.add('active');
                }
            }
        });
    });

     // --- Activate scrollspy to add active class to navbar items on scroll ---
     // This is a simplified version. For perfect accuracy, consider a library or more robust logic.
     const sections = document.querySelectorAll('section[id]'); // Target sections with IDs
     const pageTopLink = document.querySelector('.navbar-brand[href="#page-top"]'); // Link to top

     function updateActiveNavLinkOnScroll() {
        let currentSectionId = '';
        const scrollY = window.pageYOffset;
        const navHeight = mainNav ? mainNav.offsetHeight : 70; // Estimate or get height

        sections.forEach(section => {
             const sectionTop = section.offsetTop - navHeight - 50; // Offset for nav + buffer
             const sectionBottom = sectionTop + section.offsetHeight;

             if (scrollY >= sectionTop && scrollY < sectionBottom) {
                 currentSectionId = section.getAttribute('id');
             }
         });

         navLinks.forEach(link => {
             link.classList.remove('active');
             if (link.getAttribute('href') === `#${currentSectionId}`) {
                 link.classList.add('active');
             }
         });

         // Handle page top (no section active)
         if (!currentSectionId && scrollY < sections[0].offsetTop - navHeight - 50 && pageTopLink) {
             navLinks.forEach(link => link.classList.remove('active')); // Deactivate all section links
             // Optionally highlight the brand/home link if desired
         }
     }

    window.addEventListener('scroll', updateActiveNavLinkOnScroll);
    updateActiveNavLinkOnScroll(); // Initial check

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contact-form');
    const formResultDiv = document.getElementById('contact-form-result');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            formResultDiv.innerHTML = '<p class="text-info small">Sending message...</p>';
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const endpointUrl = 'YOUR_SERVER_ENDPOINT_URL'; // <<<< REPLACE THIS

            console.log("Simulating AJAX request to:", endpointUrl);
            console.log("Form Data:", data);

            setTimeout(() => {
                const simulatedSuccess = Math.random() > 0.2; // Simulate success most of the time

                if (simulatedSuccess) {
                    formResultDiv.innerHTML = '<div class="alert alert-success" role="alert">Message sent successfully! Thank you.</div>';
                    contactForm.reset();
                } else {
                     formResultDiv.innerHTML = '<div class="alert alert-danger" role="alert">Sorry, there was an error sending your message. Please try again later.</div>';
                }

                if(submitButton) submitButton.disabled = false;

                setTimeout(() => {
                    formResultDiv.innerHTML = '';
                }, 6000);

            }, 1500);

            /*
            // --- ACTUAL FETCH CALL ---
             fetch(endpointUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
                .then(response => { if (!response.ok) { return response.json().then(err => { throw err; }); } return response.json(); })
                .then(result => {
                     if (result.success) {
                         formResultDiv.innerHTML = '<div class="alert alert-success">Message sent successfully! Thank you.</div>'; contactForm.reset();
                     } else {
                          formResultDiv.innerHTML = `<div class="alert alert-warning">Could not send message: ${result.message || 'Please check input.'}</div>`;
                     } })
                .catch(error => { console.error('Error submitting form:', error); formResultDiv.innerHTML = '<div class="alert alert-danger">Network error. Please try again later.</div>'; })
                .finally(() => { if(submitButton) submitButton.disabled = false; setTimeout(() => { formResultDiv.innerHTML = ''; }, 6000); });
            // --- END FETCH ---
            */
        });
    }

}); // End DOMContentLoaded
