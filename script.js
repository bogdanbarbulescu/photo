// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scrolling for Navbar Links ---
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Check if it's an internal link
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault(); // Prevent default anchor jump
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Calculate position, accounting for sticky navbar height
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Optional: Close mobile navbar if open
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        const toggler = document.querySelector('.navbar-toggler');
                        toggler.click(); // Simulate click to close
                    }

                    // Optional: Update active link state (basic)
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contact-form');
    const formResultDiv = document.getElementById('contact-form-result');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            formResultDiv.innerHTML = '<p class="text-info">Sending message...</p>'; // Provide immediate feedback
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true; // Disable button during submission

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries()); // Convert FormData to simple object

            // **IMPORTANT**: Replace 'YOUR_SERVER_ENDPOINT_URL' with the actual URL
            //              of your server-side script (e.g., a PHP file, Node.js route)
            //              that will process the form data (e.g., send an email).
            //              For demonstration, we'll simulate the fetch call.

            const endpointUrl = 'YOUR_SERVER_ENDPOINT_URL'; // <<<< REPLACE THIS

            // Simulate fetch call (replace with actual fetch)
            console.log("Simulating AJAX request to:", endpointUrl);
            console.log("Form Data:", data);

            setTimeout(() => { // Simulate network delay
                 // Simulate a successful response
                const simulatedSuccess = true; // Change to false to test error handling

                if (simulatedSuccess) {
                    formResultDiv.innerHTML = '<p class="alert alert-success form-success">Message sent successfully! Thank you.</p>';
                    contactForm.reset(); // Clear the form fields
                } else {
                    // Simulate an error response
                     formResultDiv.innerHTML = '<p class="alert alert-danger form-error">Sorry, there was an error sending your message. Please try again later.</p>';
                }

                submitButton.disabled = false; // Re-enable button

                // Optional: Clear the message after a few seconds
                setTimeout(() => {
                    formResultDiv.innerHTML = '';
                }, 5000); // Clear after 5 seconds

            }, 1500); // Simulate 1.5 second delay

            /*
            // --- ACTUAL FETCH CALL (Use this when you have a backend) ---
            fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers if required (like CSRF tokens)
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data) // Send data as JSON
            })
            .then(response => {
                if (!response.ok) {
                    // If server response is not 2xx, throw an error
                    return response.json().then(err => { throw err; }); // Try to parse error details if available
                }
                return response.json(); // Assuming server sends back JSON { success: true } or similar
            })
            .then(result => {
                 if (result.success) { // Check the specific success flag from your server response
                    formResultDiv.innerHTML = '<p class="alert alert-success form-success">Message sent successfully! Thank you.</p>';
                    contactForm.reset();
                 } else {
                    // Handle server-side validation errors or other issues
                     formResultDiv.innerHTML = `<p class="alert alert-warning form-error">Could not send message: ${result.message || 'Please check your input.'}</p>`;
                 }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                formResultDiv.innerHTML = '<p class="alert alert-danger form-error">Sorry, there was a network error sending your message. Please try again later.</p>';
            })
            .finally(() => {
                submitButton.disabled = false; // Re-enable button regardless of outcome
                 // Optional: Clear the message after a few seconds
                 setTimeout(() => {
                    formResultDiv.innerHTML = '';
                 }, 5000);
            });
            // --- END OF ACTUAL FETCH CALL ---
            */

        });
    }

    // --- Update Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('main section[id]');
    const navbarHeight = document.querySelector('.navbar').offsetHeight;

    function updateActiveNavLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 50; // Add some offset
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
         // Handle edge case for top of page (Home)
         if (!currentSectionId && window.pageYOffset < sections[0].offsetTop - navbarHeight - 50) {
            navLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('.nav-link[href="#home"]');
            if(homeLink) homeLink.classList.add('active');
         }
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial check on load


}); // End DOMContentLoaded
