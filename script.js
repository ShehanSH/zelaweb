// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Function to handle product ordering via WhatsApp
function orderProduct(productName) {
    // WhatsApp business number
    // Format: country code + number (no + sign or spaces), e.g., 94786628990
    const phoneNumber = '94786628990';
    
    // Create WhatsApp message
    const message = encodeURIComponent(`Hi! I'm interested in ordering: ${productName}. Please provide more details.`);
    
    // WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
}

// Simple scroll behavior - no complex animations

// Navbar background on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.12)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
    }

    lastScroll = currentScroll;
});

// Simple hover effects for social links (handled by CSS)

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

function openMobileMenu() {
    mobileMenuBtn.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

// Close menu when clicking on overlay (outside menu content)
if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', function(e) {
        if (e.target === mobileMenuOverlay) {
            closeMobileMenu();
        }
    });
}

// Close menu when clicking on a link
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

// Close menu on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Simple product card interactions
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking on buttons or gallery controls
        if (!e.target.closest('.btn-order') && 
            !e.target.closest('.btn-view') && 
            !e.target.closest('.gallery-nav') && 
            !e.target.closest('.gallery-dots') &&
            !e.target.closest('.gallery-container')) {
            const orderBtn = this.querySelector('.btn-order');
            if (orderBtn) {
                orderBtn.click();
            }
        }
    });
});

// Image Gallery Functionality for Blouse Product
let currentBlouseImageIndex = 0;
const blouseImages = document.querySelectorAll('#blouseGallery .gallery-image');
const blouseDots = document.querySelectorAll('#blouseGallery .dot');
const totalBlouseImages = blouseImages.length;

function showBlouseImage(index) {
    // Ensure index is within bounds
    if (index < 0) {
        index = totalBlouseImages - 1;
    } else if (index >= totalBlouseImages) {
        index = 0;
    }
    
    currentBlouseImageIndex = index;
    
    // Update images
    blouseImages.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
    
    // Update dots
    blouseDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function changeBlouseImage(direction, e) {
    if (e) {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent default behavior
    }
    showBlouseImage(currentBlouseImageIndex + direction);
}

function goToBlouseImage(index, e) {
    if (e) {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent default behavior
    }
    showBlouseImage(index);
}

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;
const galleryContainer = document.getElementById('blouseGallery');

if (galleryContainer) {
    galleryContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                changeBlouseImage(1);
            } else {
                // Swipe right - previous image
                changeBlouseImage(-1);
            }
        }
    }

    // Mouse drag support for desktop
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    galleryContainer.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        galleryContainer.style.cursor = 'grabbing';
    });

    galleryContainer.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        currentX = e.clientX;
    });

    galleryContainer.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        galleryContainer.style.cursor = 'grab';
        
        const diff = startX - currentX;
        const swipeThreshold = 50;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeBlouseImage(1);
            } else {
                changeBlouseImage(-1);
            }
        }
    });

    galleryContainer.addEventListener('mouseleave', function() {
        isDragging = false;
        galleryContainer.style.cursor = 'grab';
    });
}

// Auto-play option (optional - can be enabled)
// Uncomment the following lines if you want auto-rotation
/*
let autoPlayInterval;
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        changeBlouseImage(1);
    }, 4000); // Change image every 4 seconds
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

// Start auto-play when hovering over the product card
const blouseCard = document.querySelector('.product-card:has(#blouseGallery)');
if (blouseCard) {
    blouseCard.addEventListener('mouseenter', stopAutoPlay);
    blouseCard.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
}
*/