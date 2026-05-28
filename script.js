document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. MOBILE NAVIGATION DRAWER
       ========================================================================== */
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    const toggleMobileNav = () => {
        mobileNavToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
        // Toggle body scroll lock
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    };

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);
    }

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileNav();
            }
        });
    });

    /* ==========================================================================
       2. ACTIVE LINK HIGHLIGHTING & SMOOTH SCROLLING
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    
    const highlightActiveLink = () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150; // offset for sticky header
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', highlightActiveLink);

    /* ==========================================================================
       3. SCROLL REVEAL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    /* ==========================================================================
       4. INTERACTIVE BEFORE/AFTER SLIDER
       ========================================================================== */
    const slider = document.getElementById('before-after-slider');
    const afterImage = document.querySelector('.after-image');
    const handle = document.getElementById('slider-handle');
    
    if (slider && afterImage && handle) {
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const x = clientX - rect.left;
            
            // Calculate percentage position
            let percentage = (x / rect.width) * 100;
            
            // Keep handle within boundaries
            if (percentage < 3) percentage = 3;
            if (percentage > 97) percentage = 97;
            
            // Update visual elements
            afterImage.style.width = `${percentage}%`;
            handle.style.left = `${percentage}%`;
        };

        // Event listeners for dragging
        const startDragging = () => {
            isDragging = true;
        };

        const stopDragging = () => {
            isDragging = false;
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            
            // Handle both desktop mouse and mobile touch
            let clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX) {
                updateSlider(clientX);
            }
        };

        // Desktop Mouse Events
        handle.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', onDrag);

        // Mobile Touch Events
        handle.addEventListener('touchstart', startDragging, { passive: true });
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', onDrag, { passive: true });

        // Let users click anywhere on slider to jump to that comparison point
        slider.addEventListener('click', (e) => {
            if (e.target.closest('#slider-handle')) return; // ignore clicks on handle itself
            updateSlider(e.clientX);
        });
    }

    /* ==========================================================================
       5. INTERACTIVE PRICE CALCULATOR
       ========================================================================== */
    const calcService = document.getElementById('calc-service');
    const calcAreaRange = document.getElementById('calc-area-range');
    const calcAreaNumber = document.getElementById('calc-area-number');
    const calcWood = document.getElementById('calc-wood');
    const calcChimney = document.getElementById('calc-chimney');
    const calcTotal = document.getElementById('calc-total');
    const serviceDesc = document.getElementById('service-desc');
    
    if (calcService && calcAreaRange && calcAreaNumber && calcTotal) {
        
        // Sync Range Slider and Number Input
        calcAreaRange.addEventListener('input', () => {
            calcAreaNumber.value = calcAreaRange.value;
            calculatePrice();
        });
        
        calcAreaNumber.addEventListener('input', () => {
            let val = parseInt(calcAreaNumber.value) || 0;
            if (val < 10) val = 10;
            if (val > 500) val = 500;
            calcAreaRange.value = val;
            calculatePrice();
        });
        
        calcAreaNumber.addEventListener('blur', () => {
            if (!calcAreaNumber.value || calcAreaNumber.value < 10) {
                calcAreaNumber.value = 10;
                calcAreaRange.value = 10;
                calculatePrice();
            }
        });

        // Trigger on change of dropdown or checkboxes
        calcService.addEventListener('change', () => {
            // Update service explanation description
            const selectedOption = calcService.options[calcService.selectedIndex];
            serviceDesc.textContent = selectedOption.getAttribute('data-desc');
            calculatePrice();
        });

        calcWood.addEventListener('change', calculatePrice);
        calcChimney.addEventListener('change', calculatePrice);

        // Price calculation core logic
        function calculatePrice() {
            const area = parseInt(calcAreaNumber.value) || 0;
            const pricePerSqMeter = parseFloat(calcService.value) || 0;
            
            // Base service price
            let total = area * pricePerSqMeter;
            
            // Option 1: Replace decaying wood structure (+15 lv per sq. meter)
            if (calcWood.checked) {
                total += area * parseFloat(calcWood.value);
            }
            
            // Option 2: Flash chimneys (+150 lv flat)
            if (calcChimney.checked) {
                total += parseFloat(calcChimney.value);
            }
            
            // Round to whole numbers and display
            calcTotal.textContent = Math.round(total).toLocaleString('bg-BG');
        }

        // Run initial calculation on page load
        calculatePrice();
    }

    /* ==========================================================================
       6. CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const btnSpinner = document.querySelector('.btn-spinner');
    
    if (contactForm && successModal) {
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Validate Name
            const nameInput = document.getElementById('form-name');
            if (nameInput.value.trim().length < 2) {
                showError(nameInput);
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            // Validate Phone (Bulgarian number simple regex test)
            const phoneInput = document.getElementById('form-phone');
            const phoneRegex = /^(\+359|0)8[789]\d{7}$/; // Bulgarian mobile numbers
            if (!phoneRegex.test(phoneInput.value.trim().replace(/\s+/g, ''))) {
                showError(phoneInput);
                isValid = false;
            } else {
                clearError(phoneInput);
            }
            
            // Validate Location
            const locationInput = document.getElementById('form-location');
            if (locationInput.value.trim().length < 3) {
                showError(locationInput);
                isValid = false;
            } else {
                clearError(locationInput);
            }
            
            if (isValid) {
                // Show submission animation state
                formSubmitBtn.disabled = true;
                btnSpinner.classList.remove('hide');
                const btnText = formSubmitBtn.querySelector('span');
                const originalText = btnText.textContent;
                btnText.textContent = 'Изпраща се...';
                
                // Simulate server latency (1.5 seconds)
                setTimeout(() => {
                    // Reset button states
                    formSubmitBtn.disabled = false;
                    btnSpinner.classList.add('hide');
                    btnText.textContent = originalText;
                    
                    // Show success modal popup
                    successModal.classList.remove('hide');
                    document.body.style.overflow = 'hidden'; // Lock scrolling
                    
                    // Reset form fields
                    contactForm.reset();
                }, 1500);
            }
        });
        
        // Setup validation helper error functions
        function showError(inputElement) {
            const formGroup = inputElement.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('has-error');
            }
        }
        
        function clearError(inputElement) {
            const formGroup = inputElement.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('has-error');
            }
        }
        
        // Remove error indicator dynamically when user starts typing/correcting
        const inputsToValidate = contactForm.querySelectorAll('.form-control');
        inputsToValidate.forEach(input => {
            input.addEventListener('input', () => {
                clearError(input);
            });
        });

        // Close Modal events
        modalCloseBtn.addEventListener('click', () => {
            successModal.classList.add('hide');
            document.body.style.overflow = ''; // Unlock scrolling
        });

        // Close modal clicking backdrop overlay
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.add('hide');
                document.body.style.overflow = '';
            }
        });
    }
});
