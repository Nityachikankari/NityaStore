// Cart Management with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    console.log('Updating cart table with cart:', cart);
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.color}</td>
            <td>₹${item.price}</td>
            <td>
                <div class="cart-quantity-control">
                    <button class="cart-decrease" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">−</button>
                    <span>${item.quantity}</span>
                    <button class="cart-increase" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">+</button>
                </div>
            </td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        `;
        cartItems.appendChild(row);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = `₹${total.toFixed(2)}`;
    saveCart();
}

function updateQuantity(id, size, color, change, quantitySpan, decreaseBtn) {
    console.log(`updateQuantity called with id: ${id}, size: ${size}, color: ${color}, change: ${change}`);
    console.log('Cart before update:', cart);
    try {
        const item = cart.find(item => item.id === id && item.size === size && item.color === color);
        const card = document.querySelector(`.product-card[data-id="${id}"]`);
        const selectedSize = card ? card.querySelector('.size-dropdown').value : (item ? item.size : 'M');
        const selectedColor = card ? card.querySelector('.color-dropdown').value : (item ? item.color : 'Blue');
        let newQuantity;
        let isNewItem = false;

        if (item) {
            item.quantity += change;
            newQuantity = item.quantity;
            console.log(`Item quantity updated to: ${newQuantity}`);
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => !(cartItem.id === id && cartItem.size === size && cartItem.color === color));
                newQuantity = 0;
                console.log('Item removed from cart');
            }
        } else if (change > 0) {
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            cart.push({ id, name, price, size: selectedSize, color: selectedColor, quantity: 1 });
            newQuantity = 1;
            isNewItem = true;
            console.log(`New item added to cart: ${name}, Size: ${selectedSize}, Color: ${selectedColor}, Quantity: 1`);
        } else {
            newQuantity = 0;
            console.log('No item found and change <= 0, setting quantity to 0');
        }

        if (quantitySpan && decreaseBtn) {
            if (selectedSize === size && selectedColor === color) {
                quantitySpan.textContent = newQuantity;
                decreaseBtn.disabled = newQuantity === 0;
                console.log(`UI updated - Quantity span set to: ${quantitySpan.textContent}, Decrease button disabled: ${decreaseBtn.disabled}`);
            }

            if (isNewItem && card) {
                const productImage = card.querySelector('.product-image');
                const cartLink = document.querySelector('.nav-links a[href="cart.html"]');
                if (productImage && cartLink) {
                    const imgClone = productImage.cloneNode(true);
                    imgClone.classList.add('cart-animation');
                    document.body.appendChild(imgClone);

                    const cardRect = card.getBoundingClientRect();
                    const endRect = cartLink.getBoundingClientRect();

                    const cloneWidth = imgClone.width;
                    const cloneHeight = imgClone.height;
                    const startX = cardRect.left + (cardRect.width / 2) - (cloneWidth / 2);
                    const startY = cardRect.top + window.scrollY - cloneHeight - 10;

                    imgClone.style.left = `${startX}px`;
                    imgClone.style.top = `${startY}px`;

                    const endX = endRect.left + (endRect.width / 2) - (cloneWidth / 2);
                    const endY = endRect.top + window.scrollY + (endRect.height / 2) - (cloneHeight / 2);

                    requestAnimationFrame(() => {
                        imgClone.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
                    });

                    imgClone.addEventListener('animationend', () => {
                        imgClone.remove();
                    });
                }
            }
        }

        console.log('Cart after update:', cart);
        saveCart();
        updateCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

function generateOrderNumber() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ORDER-${randomNum}`;
}

function formatOrderDetails(orderNumber, location) {
    let message = `New Order: ${orderNumber}\n\n`;
    message += `Customer Location: ${location}\n\n`;
    message += "Order Details:\n";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `- ${item.name} (Size: ${item.size}, Color: ${item.color}, Quantity: ${item.quantity}) - ₹${itemTotal.toFixed(2)}\n`;
    });

    message += `\nTotal: ₹${total.toFixed(2)}\n`;
    message += `\nPlease confirm the order and arrange for delivery`;
    message += `\nThank you for shopping with Nitya Chikankari!`;
    message += `\n\nVisit us at: ${window.location.href}`;

    return encodeURIComponent(message);
}

function syncQuantities() {
    console.log('Syncing quantities on page load');
    document.querySelectorAll('.product-card').forEach(card => {
        const id = card.dataset.id;
        const quantitySpan = card.querySelector('.quantity');
        const decreaseBtn = card.querySelector('.decrease');
        const size = card.querySelector('.size-dropdown').value;
        const color = card.querySelector('.color-dropdown').value;
        const item = cart.find(item => item.id === id && item.size === size && item.color === color);
        if (item && quantitySpan && decreaseBtn) {
            quantitySpan.textContent = item.quantity;
            quantitySpan.offsetHeight;
            decreaseBtn.disabled = item.quantity === 0;
            console.log(`Synced quantity for id ${id}, size ${size}, color ${color}: ${item.quantity}`);
        } else if (quantitySpan && decreaseBtn) {
            quantitySpan.textContent = '0';
            decreaseBtn.disabled = true;
        }
    });
}

function setupShareButton() {
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            try {
                const pageUrl = window.location.href;
                navigator.clipboard.writeText(pageUrl).then(() => {
                    alert('Link copied to clipboard! Share it with a friend.');
                }).catch(err => {
                    console.error('Failed to copy link:', err);
                    alert('Failed to copy link. Please copy the URL manually: ' + pageUrl);
                });
            } catch (error) {
                console.error('Error sharing page:', error);
            }
        });
    }
}

function setupModal() {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');
    const modalClose = document.querySelector('.modal-close');

    if (modal && modalTitle && modalGrid && modalClose) {
        document.querySelectorAll('.eye-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.parentElement;
                const images = JSON.parse(card.dataset.images);
                const details = JSON.parse(card.dataset.details);
                const price = card.dataset.price;
                const sizes = card.dataset.sizes;
                const name = card.querySelector('h3').textContent;

                modalTitle.textContent = name;
                modalGrid.innerHTML = '';
                images.forEach(imgSrc => {
                    const modalCard = document.createElement('div');
                    modalCard.classList.add('modal-card');
                    modalCard.innerHTML = `
                        <img src="${imgSrc}" alt="${name}" loading="lazy">
                        <p><strong>Material:</strong> ${details.material}</p>
                        <p><strong>Color:</strong> ${details.color}</p>
                        <p><strong>Craft:</strong> ${details.craft}</p>
                        <p class="modal-price">₹${price}</p>
                        <p class="modal-sizes"><strong>Sizes:</strong> ${sizes}</p>
                    `;
                    modalGrid.appendChild(modalCard);
                });

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.click();
            }, { passive: false });
        });

        modalClose.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Close button clicked');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        modalClose.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button touched');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });

        modalClose.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button touch ended');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Clicked outside modal');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

function setupImageZoom() {
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');
    const zoomClose = document.querySelector('.zoom-close');

    if (zoomOverlay && zoomedImage && zoomClose) {
        document.querySelectorAll('.zoomable').forEach(img => {
            img.addEventListener('click', () => {
                console.log('Image clicked for zoom:', img.src);
                zoomedImage.src = img.src;
                zoomedImage.alt = img.alt;
                zoomOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        zoomClose.addEventListener('click', () => {
            console.log('Zoom close button clicked');
            zoomOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay) {
                console.log('Clicked outside zoomed image');
                zoomOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        zoomClose.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Zoom close button touched');
            zoomOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, { passive: false });
    }
}

function setupSizeChart() {
    const sizeChartDialog = document.getElementById('size-chart-dialog');
    const sizeChartButtons = document.querySelectorAll('.size-chart-btn');
    const sizeChartClose = document.querySelector('.size-chart-close');

    console.log('Setting up size chart. Dialog:', sizeChartDialog, 'Buttons:', sizeChartButtons.length, 'Close:', sizeChartClose);

    if (!sizeChartDialog || sizeChartButtons.length === 0 || !sizeChartClose) {
        console.error('Size chart setup failed: Missing dialog, buttons, or close button.');
        return;
    }

    sizeChartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                console.log('Size chart button clicked');
                sizeChartDialog.showModal();
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('Error opening size chart dialog:', error);
                sizeChartDialog.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Size chart button touched');
            btn.click();
        }, { passive: false });
    });

    sizeChartClose.addEventListener('click', () => {
        console.log('Size chart close button clicked');
        try {
            sizeChartDialog.close();
        } catch (error) {
            console.error('Error closing size chart dialog:', error);
            sizeChartDialog.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    });

    sizeChartDialog.addEventListener('click', (e) => {
        if (e.target === sizeChartDialog) {
            console.log('Clicked outside size chart dialog');
            try {
                sizeChartDialog.close();
            } catch (error) {
                console.error('Error closing size chart dialog:', error);
                sizeChartDialog.style.display = 'none';
            }
            document.body.style.overflow = 'auto';
        }
    });

    sizeChartClose.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('Size chart close button touched');
        try {
            sizeChartDialog.close();
        } catch (error) {
            console.error('Error closing size chart dialog:', error);
            sizeChartDialog.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    }, { passive: false });

    sizeChartDialog.addEventListener('cancel', () => {
        console.log('Size chart dialog cancelled');
        document.body.style.overflow = 'auto';
    });
}

function setupProductCards() {
    console.log(`Found ${document.querySelectorAll('.product-card').length} product cards`);
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const increaseBtn = card.querySelector('.increase');
        const decreaseBtn = card.querySelector('.decrease');
        let quantitySpan = card.querySelector('.quantity');

        console.log('Increase button:', increaseBtn);
        console.log('Decrease button:', decreaseBtn);
        console.log('Quantity span:', quantitySpan);

        if (!increaseBtn || !decreaseBtn || !quantitySpan) {
            console.error('Quantity control elements not found in product card');
            return;
        }

        increaseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Increase button clicked');
            try {
                const id = card.dataset.id;
                const size = card.querySelector('.size-dropdown').value;
                const color = card.querySelector('.color-dropdown').value;
                quantitySpan = card.querySelector('.quantity');
                updateQuantity(id, size, color, 1, quantitySpan, decreaseBtn);
                const name = card.dataset.name;
                alert(`${name} added to cart!`);
            } catch (error) {
                console.error('Error increasing quantity:', error);
            }
        });

        decreaseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Decrease button clicked');
            try {
                const id = card.dataset.id;
                const size = card.querySelector('.size-dropdown').value;
                const color = card.querySelector('.color-dropdown').value;
                quantitySpan = card.querySelector('.quantity');
                const currentQuantity = parseInt(quantitySpan.textContent);
                if (currentQuantity > 0) {
                    updateQuantity(id, size, color, -1, quantitySpan, decreaseBtn);
                }
            } catch (error) {
                console.error('Error decreasing quantity:', error);
            }
        });

        card.querySelector('.size-dropdown').addEventListener('change', () => {
            syncQuantities();
        });
        card.querySelector('.color-dropdown').addEventListener('change', () => {
            syncQuantities();
        });
    });

    document.addEventListener('click', (e) => {
        console.log('Click event captured on:', e.target);
    });
}

function setupCartPage() {
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        updateCart();
        cartItems.addEventListener('click', function(e) {
            const target = e.target;
            if (target.classList.contains('cart-increase') || target.classList.contains('cart-decrease')) {
                const id = target.dataset.id;
                const size = target.dataset.size;
                const color = target.dataset.color;
                const change = target.classList.contains('cart-increase') ? 1 : -1;
                const item = cart.find(item => item.id === id && item.size === size && item.color === color);
                if (item || change > 0) {
                    const quantitySpan = document.querySelector(`.product-card[data-id="${id}"] .quantity`);
                    const decreaseBtn = document.querySelector(`.product-card[data-id="${id}"] .decrease`);
                    updateQuantity(id, size, color, change, quantitySpan, decreaseBtn);
                }
            }
        });

        const checkoutBtn = document.querySelector('.checkout-btn');
        const locationModal = document.getElementById('location-modal');
        const locationInput = document.getElementById('location-input');
        const submitLocationBtn = document.getElementById('submit-location');
        const locationModalClose = document.querySelector('.location-modal-close');

        if (checkoutBtn && locationModal && locationInput && submitLocationBtn && locationModalClose) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                } else {
                    locationModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    locationInput.value = '';
                }
            });

            submitLocationBtn.addEventListener('click', function() {
                const location = locationInput.value.trim();
                if (!location) {
                    alert('Please enter your location.');
                    return;
                }

                const orderNumber = generateOrderNumber();
                const message = formatOrderDetails(orderNumber, location);

                const whatsappNumber = '+7007992535';
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');

                cart = [];
                updateCart();
                document.querySelectorAll('.product-card').forEach(card => {
                    const quantitySpan = card.querySelector('.quantity');
                    const decreaseBtn = card.querySelector('.decrease');
                    if (quantitySpan && decreaseBtn) {
                        quantitySpan.textContent = '0';
                        quantitySpan.offsetHeight;
                        decreaseBtn.disabled = true;
                    }
                });

                locationModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            locationModalClose.addEventListener('click', () => {
                locationModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            locationModal.addEventListener('click', (e) => {
                if (e.target === locationModal) {
                    locationModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = contactForm.querySelector('input[name="name"]').value.trim();
            const message = contactForm.querySelector('textarea[name="message"]').value.trim();

            if (!name || !message) {
                alert('Please fill in all fields.');
                return;
            }

            const formattedMessage = encodeURIComponent(
                `New Contact Message\n\nName: ${name}\nMessage: ${message}\n\nFrom: Nitya Chikankari Website`
            );
            const whatsappNumber = '+7007992535';
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${formattedMessage}`;

            window.open(whatsappUrl, '_blank');
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

function setupSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    if (slides.length > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 4000);
    }
}

function setupHeroVideoCarousel() {
    const videos = document.querySelectorAll('.hero-video-slide');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    let currentVideo = 0;
    let intervalId = null;

    function showVideo(index) {
        videos.forEach((video, i) => {
            video.classList.remove('active');
            video.pause();
            video.currentTime = 0; // Reset to start
            indicators[i].classList.remove('active');
        });
        videos[index].classList.add('active');
        indicators[index].classList.add('active');
        videos[index].play().catch(e => console.error('Video play error:', e));
    }

    function nextVideo() {
        currentVideo = (currentVideo + 1) % videos.length;
        showVideo(currentVideo);
    }

    function startCarousel() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(nextVideo, 10000);
    }

    if (videos.length > 0) {
        showVideo(currentVideo);
        startCarousel();

        videos.forEach(video => {
            video.addEventListener('ended', () => {
                console.log('Video ended, switching to next');
                nextVideo();
                startCarousel(); // Restart interval after manual or end-triggered switch
            });
        });

        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                if (index !== currentVideo) {
                    currentVideo = index;
                    showVideo(currentVideo);
                    startCarousel(); // Restart interval after manual switch
                }
            });
        });
    }

    const shopNowBtn = document.getElementById('shop-now-btn');
    if (shopNowBtn) {
        videos[0].addEventListener('play', () => {
            console.log('First video started playing');
            shopNowBtn.style.display = 'inline-block';
            shopNowBtn.classList.add('fade-in');
        });
    }
}

function setupImageReveal() {
    const revealImages = document.querySelectorAll('.product-card .product-image');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealImages.forEach(img => {
        img.style.opacity = 0;
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(img);
    });
}

function setupTestimonials() {
    const toggleButton = document.querySelector('.toggle-testimonials');
    const testimonials = document.getElementById('testimonials');

    if (toggleButton && testimonials) {
        toggleButton.addEventListener('click', () => {
            testimonials.classList.toggle('hidden');
            toggleButton.textContent = testimonials.classList.contains('hidden') ? 'View Testimonials' : 'Hide Testimonials';
        });
    }
}

function setupAnimation() {
    const animationContainer = document.getElementById('animation-container');
    if (animationContainer) {
        animationContainer.style.opacity = '0';
        setTimeout(() => {
            animationContainer.style.opacity = '1';
        }, 100);
        setTimeout(() => {
            animationContainer.style.opacity = '0';
            setTimeout(() => {
                animationContainer.style.display = 'none';
            }, 500);
        }, 3000);
    }
}

function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        console.log('Hamburger and navLinks found');
        hamburger.addEventListener('click', () => {
            console.log('Hamburger clicked');
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    } else {
        console.error('Hamburger or navLinks not found in the DOM');
        setTimeout(initHamburgerMenu, 500);
    }
}

window.initHamburgerMenu = initHamburgerMenu;

function initialize() {
    console.log('Initializing scripts');
    setupShareButton();
    setupModal();
    setupImageZoom();
    setupProductCards();
    syncQuantities();
    setupCartPage();
    setupContactForm();
    setupSlideshow();
    setupHeroVideoCarousel();
    setupImageReveal();
    setupTestimonials();
    setupAnimation();
    setupSizeChart();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}