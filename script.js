import { initFirebase, fetchProducts } from "./firebase-public.js";

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

// Local fallback products (used only if Firebase isn't configured yet)
let products = [
    {
        id: 'item7',
        name: 'Latest Arrival — Style 7',
        price: 'Rs.1690/=',
        material: 'Premium fabric (details on WhatsApp)',
        outOfStock: false,
        images: [
            'images/item7/1.png',
            'images/item7/2.png',
            'images/item7/3.png',
            'images/item7/4.png',
            'images/item7/5.png'
        ]
    },
    {
        id: 'item6',
        name: 'Latest Arrival — Style 6',
        price: 'Rs.1590/=',
        material: 'Premium fabric (details on WhatsApp)',
        outOfStock: false,
        images: [
            'images/item6/1.png',
            'images/item6/2.png',
            'images/item6/3.png',
            'images/item6/4.png',
            'images/item6/5.png'
        ]
    },
    {
        id: 'item5',
        name: 'Rose Print Kaftan Frock',
        price: 'Rs.1600/=',
        material: 'Glass Printed Material',
        outOfStock: false,
        images: [
            'images/item5/1.png',
            'images/item5/2.png',
            'images/item5/3.png',
            'images/item5/4.png',
            'images/item5/5.png'
        ]
    },
    {
        id: 'item4',
        name: 'Pink Puff Sleeve Fitted Top',
        price: 'Rs.1500/=',
        material: 'Polly Cotton (Soft & Comfortable)',
        outOfStock: false,
        images: [
            'images/item4/1.png',
            'images/item4/2.png',
            'images/item4/3.png',
            'images/item4/4.png',
            'images/item4/5.png'
        ]
    },
    {
        id: 'item3',
        name: 'Ivory Floral Relaxed Top',
        price: 'Rs.1500/=',
        material: 'Glass Printed Material',
        outOfStock: false,
        images: [
            'images/item3/1.png',
            'images/item3/2.png',
            'images/item3/3.png',
            'images/item3/4.png',
            'images/item3/5.png',
            'images/item3/6.png'
        ]
    },
    {
        id: 'item2',
        name: 'Black Mustard Mandala Top',
        price: 'Rs.1450/=',
        material: 'Italian Crush',
        outOfStock: true,
        images: [
            'images/item2/1.png',
            'images/item2/2.png',
            'images/item2/3.png',
            'images/item2/4.png'
        ]
    },
    {
        id: 'item1',
        name: 'Navy Geometric Wrap Top',
        price: 'Rs.1490/=',
        material: 'Italian Crush',
        outOfStock: true,
        images: [
            'images/item1/1.png',
            'images/item1/2.png',
            'images/item1/3.png',
            'images/item1/4.png'
        ]
    }
];

const galleryState = {};
const wishlistStorageKey = 'zelaWishlistItems';
let wishlist = new Set(JSON.parse(localStorage.getItem(wishlistStorageKey) || '[]'));

async function loadProductsFromFirebaseIfConfigured() {
    const fb = initFirebase();
    if (!fb) {
        return;
    }
    try {
        const remote = await fetchProducts(fb.db);
        if (Array.isArray(remote) && remote.length) {
            // Map Firestore schema to app schema
            products = remote.map(p => ({
                id: p.id,
                name: p.name || 'Untitled',
                description: p.description || '',
                price: p.price || '',
                material: p.material || '',
                outOfStock: Boolean(p.outOfStock),
                images: Array.isArray(p.images) ? p.images : [],
                displayOrder: Number(p.displayOrder || 0)
            }));
        }
    } catch (e) {
        // Keep local fallback if Firestore fails
        console.warn('Firebase products load failed, using local products.', e);
    }
}

function orderProduct(productName) {
    const phoneNumber = '94786628990';
    const message = encodeURIComponent(`Hi! I'm interested in ordering: ${productName}. Please provide more details.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function updateWishlistCount() {
    const countEl = document.getElementById('wishlistCount');
    const countFabEl = document.getElementById('wishlistCountFab');
    if (countEl) {
        countEl.textContent = String(wishlist.size);
    }
    if (countFabEl) {
        countFabEl.textContent = String(wishlist.size);
    }
}

function persistWishlist() {
    localStorage.setItem(wishlistStorageKey, JSON.stringify(Array.from(wishlist)));
}

function toggleWishlist(productId) {
    if (wishlist.has(productId)) {
        wishlist.delete(productId);
    } else {
        wishlist.add(productId);
    }
    persistWishlist();
    updateWishlistCount();

    const button = document.querySelector(`.wishlist-btn[data-product-id="${productId}"]`);
    if (button) {
        button.classList.toggle('active', wishlist.has(productId));
        button.setAttribute('aria-pressed', wishlist.has(productId) ? 'true' : 'false');
    }

    renderWishlistSection();
}

/** Tiny transparent GIF — real product URLs are set from data-src when user opens that slide */
const PLACEHOLDER_IMG =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function ensureGalleryImageSrc(gallery, slideIndex) {
    const imgs = gallery.querySelectorAll('.gallery-image');
    const img = imgs[slideIndex];
    if (!img || !img.dataset.src) return;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.classList.remove('gallery-image--pending');
}

function showImage(productId, index) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const total = product.images.length;
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    galleryState[productId] = index;

    const gallery = document.querySelector(`.gallery-container[data-product-id="${productId}"]`);
    if (!gallery) return;

    ensureGalleryImageSrc(gallery, index);

    gallery.querySelectorAll('.gallery-image').forEach((imageEl, imageIndex) => {
        imageEl.classList.toggle('active', imageIndex === index);
    });

    gallery.querySelectorAll('.dot').forEach((dotEl, dotIndex) => {
        dotEl.classList.toggle('active', dotIndex === index);
    });
}

function changeImage(productId, direction, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const current = galleryState[productId] || 0;
    showImage(productId, current + direction);
}

function goToImage(productId, index, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    showImage(productId, index);
}

function bindGallerySkeletons() {
    document.querySelectorAll('.gallery-container').forEach(container => {
        const activeImg = container.querySelector('.gallery-image.active');
        if (!activeImg) {
            container.classList.add('gallery-loaded');
            return;
        }
        const done = () => container.classList.add('gallery-loaded');
        if (activeImg.complete && activeImg.naturalWidth > 0) {
            done();
        } else {
            activeImg.addEventListener('load', done, { once: true });
            activeImg.addEventListener('error', done, { once: true });
        }
    });
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const sorted = [...products].sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0));
    const markup = sorted.map((product, productIndex) => {
        const out = Boolean(product.outOfStock);
        const imageMarkup = product.images
            .map((imagePath, index) => {
                const isFirstSlide = index === 0;
                const priorityAttr =
                    productIndex === 0 && isFirstSlide ? ' fetchpriority="high"' : '';
                if (isFirstSlide) {
                    return `
            <img src="${imagePath}" alt="${product.name} - view ${index + 1}" class="gallery-image active" decoding="async" loading="eager"${priorityAttr}>`;
                }
                return `
            <img src="${PLACEHOLDER_IMG}" data-src="${imagePath}" alt="${product.name} - view ${index + 1}" class="gallery-image gallery-image--pending" decoding="async" loading="lazy">`;
            })
            .join('');

        const dotMarkup = product.images.map((_, index) => `
            <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `).join('');

        const badgeHtml = out ? '' : '<span class="product-badge">New</span>';

        const overlayCta = out
            ? ''
            : `<button type="button" class="btn-view" data-product-name="${product.name}">Order Now</button>`;

        const orderBtnHtml = out
            ? `<span class="product-status-pill" role="status">Out of Stock</span>`
            : `<button type="button" class="btn-order" data-product-name="${product.name}">Order</button>`;

        const footerHtml = `<div class="product-footer">
                    <span class="product-price">${product.price}</span>
                    ${orderBtnHtml}
                </div>`;

        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image-gallery">
                    ${badgeHtml}
                    <button class="wishlist-btn ${wishlist.has(product.id) ? 'active' : ''}" data-product-id="${product.id}" aria-label="Add to wishlist" aria-pressed="${wishlist.has(product.id) ? 'true' : 'false'}">❤</button>

                    <div class="gallery-container gallery-loading" data-product-id="${product.id}">
                        <div class="gallery-wrapper">
                            <div class="gallery-skeleton" aria-hidden="true"></div>
                            ${imageMarkup}
                        </div>
                        <button type="button" class="gallery-nav gallery-prev" aria-label="Previous image" data-direction="-1">&#8249;</button>
                        <button type="button" class="gallery-nav gallery-next" aria-label="Next image" data-direction="1">&#8250;</button>
                        <div class="gallery-dots">
                            ${dotMarkup}
                        </div>
                    </div>

                    ${overlayCta ? `<div class="product-overlay">${overlayCta}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                    <p class="product-description"><strong>Material:</strong> ${product.material}</p>
                    ${footerHtml}
                </div>
            </article>
        `;
    }).join('');

    grid.innerHTML = markup;
    products.forEach(product => {
        galleryState[product.id] = 0;
    });
    bindGallerySkeletons();
}

function renderWishlistSection() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    if (!wishlistGrid || !wishlistEmpty) return;

    const wishlistItems = products.filter(product => wishlist.has(product.id));

    if (wishlistItems.length === 0) {
        wishlistGrid.innerHTML = '';
        wishlistEmpty.style.display = 'block';
        return;
    }

    wishlistEmpty.style.display = 'none';
    wishlistGrid.innerHTML = wishlistItems.map(product => {
        const out = Boolean(product.outOfStock);
        const orderOrStatus = out
            ? `<span class="product-status-pill" role="status">Out of Stock</span>`
            : `<button type="button" class="btn-order wishlist-order" data-product-name="${product.name}">Order</button>`;
        return `
        <article class="wishlist-card">
            <img src="${product.images[0]}" alt="${product.name}" class="wishlist-image" decoding="async" loading="lazy">
            <div class="wishlist-info">
                <h3>${product.name}</h3>
                <p><strong>Material:</strong> ${product.material}</p>
                <div class="wishlist-footer">
                    <span class="product-price">${product.price}</span>
                    ${orderOrStatus}
                </div>
                <div class="wishlist-actions">
                    <button type="button" class="wishlist-remove" data-product-id="${product.id}">Remove</button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function setupProductEvents() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    productGrid.addEventListener('click', event => {
        const orderButton = event.target.closest('.btn-order, .btn-view');
        if (orderButton) {
            event.preventDefault();
            event.stopPropagation();
            if (orderButton.disabled || orderButton.classList.contains('btn-view--disabled') || orderButton.classList.contains('btn-order--disabled')) {
                return;
            }
            const productName = orderButton.getAttribute('data-product-name');
            if (productName) {
                orderProduct(productName);
            }
            return;
        }

        const wishlistButton = event.target.closest('.wishlist-btn');
        if (wishlistButton) {
            event.preventDefault();
            event.stopPropagation();
            const productId = wishlistButton.getAttribute('data-product-id');
            if (productId) {
                toggleWishlist(productId);
            }
            return;
        }

        const navButton = event.target.closest('.gallery-nav');
        if (navButton) {
            const gallery = navButton.closest('.gallery-container');
            if (!gallery) return;
            const productId = gallery.getAttribute('data-product-id');
            const direction = Number(navButton.getAttribute('data-direction') || '0');
            if (productId && direction !== 0) {
                changeImage(productId, direction, event);
            }
            return;
        }

        const dot = event.target.closest('.dot');
        if (dot) {
            const gallery = dot.closest('.gallery-container');
            if (!gallery) return;
            const productId = gallery.getAttribute('data-product-id');
            const index = Number(dot.getAttribute('data-index') || '0');
            if (productId) {
                goToImage(productId, index, event);
            }
        }
    });

    productGrid.querySelectorAll('.gallery-container').forEach(gallery => {
        const productId = gallery.getAttribute('data-product-id');
        if (!productId) return;

        let touchStartX = 0;
        let touchEndX = 0;
        let dragStartX = 0;
        let dragEndX = 0;
        let isDragging = false;

        gallery.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        gallery.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 45) {
                changeImage(productId, diff > 0 ? 1 : -1);
            }
        }, { passive: true });

        gallery.addEventListener('mousedown', e => {
            isDragging = true;
            dragStartX = e.clientX;
            dragEndX = e.clientX;
        });

        gallery.addEventListener('mousemove', e => {
            if (!isDragging) return;
            dragEndX = e.clientX;
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = dragStartX - dragEndX;
            if (Math.abs(diff) > 45) {
                changeImage(productId, diff > 0 ? 1 : -1);
            }
        };

        gallery.addEventListener('mouseup', endDrag);
        gallery.addEventListener('mouseleave', endDrag);
    });
}

function setupWishlistEvents() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;

    wishlistGrid.addEventListener('click', event => {
        const orderButton = event.target.closest('.wishlist-order');
        if (orderButton) {
            if (orderButton.disabled || orderButton.classList.contains('btn-order--disabled')) {
                return;
            }
            const productName = orderButton.getAttribute('data-product-name');
            if (productName) {
                orderProduct(productName);
            }
            return;
        }

        const removeButton = event.target.closest('.wishlist-remove');
        if (removeButton) {
            const productId = removeButton.getAttribute('data-product-id');
            if (productId && wishlist.has(productId)) {
                wishlist.delete(productId);
                persistWishlist();
                updateWishlistCount();
                renderProducts();
                renderWishlistSection();
            }
        }
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    if (!navbar) return;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.12)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
    }
});

// Mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

function openMobileMenu() {
    if (!mobileMenuBtn || !mobileMenuOverlay) return;
    mobileMenuBtn.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    if (!mobileMenuBtn || !mobileMenuOverlay) return;
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

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', e => {
        if (e.target === mobileMenuOverlay) {
            closeMobileMenu();
        }
    });
}

mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
    }
});

renderProducts();
setupProductEvents();
setupWishlistEvents();
renderWishlistSection();
updateWishlistCount();

// Load remote products if Firebase is configured, then re-render
loadProductsFromFirebaseIfConfigured().then(() => {
    renderProducts();
    renderWishlistSection();
});