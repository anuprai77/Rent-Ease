document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage (shared across all pages)
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Shared function to update cart count in navbar (used on all pages)
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // "Add to Cart" functionality (for pages like index.html)
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                // Example item data (replace with dynamic data from your product)
                const item = {
                    name: 'Smart Washing Machine',
                    description: 'Energy-efficient 7kg front-load washing machine.',
                    category: 'Appliances',
                    price: 'Rs.799/month',
                    image: 'images/washing-machine.jpg',
                    rating: 4.5,
                    reviews: 24,
                    quantity: 1
                };

                // Check if item already exists in cart
                const existingItem = cartItems.find(i => i.name === item.name);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cartItems.push(item);
                }

                // Save updated cart to localStorage
                localStorage.setItem('cartItems', JSON.stringify(cartItems));

                // Update cart count on current page
                updateCartCount();

                // Redirect or scroll to cart section
                if (window.location.pathname.includes('cart.html')) {
                    // If on cart.html, scroll to cart section
                    const cartSection = document.querySelector('.cart-section');
                    if (cartSection) {
                        cartSection.scrollIntoView({ behavior: 'smooth' });
                        // Re-render cart items since we're on cart.html
                        const renderCartItems = window.renderCartItems;
                        if (typeof renderCartItems === 'function') {
                            renderCartItems();
                        }
                    }
                } else {
                    // If on another page, redirect to cart.html with query param
                    window.location.href = 'cart.html?addedToCart=true';
                }
            });
        });
    }

    // Cart page functionality (for cart.html)
    const cartContainer = document.querySelector('.cart-items');
    if (cartContainer) {
        const emptyCartMessage = document.querySelector('.empty-cart-message');
        const cartSection = document.querySelector('.cart-section');

        // Render cart items
        function renderCartItems() {
            if (cartItems.length === 0) {
                emptyCartMessage.classList.remove('hidden');
                return;
            }

            emptyCartMessage.classList.add('hidden');
            cartContainer.innerHTML = '';

            cartItems.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-desc">${item.description}</p>
                        <div class="item-meta">
                            <span class="item-category">${item.category}</span>
                            <div class="item-rating">
                                ${generateRatingStars(item.rating)}
                                <span>(${item.reviews})</span>
                            </div>
                        </div>
                    </div>
                    <div class="item-price">
                        <span class="price">${item.price}</span>
                        <div class="item-quantity">
                            <button class="quantity-btn minus" data-index="${index}"><i class="fas fa-minus"></i></button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-index="${index}"><i class="fas fa-times"></i></button>
                `;
                cartContainer.appendChild(cartItem);
            });

            updateCartSummary();
            updateCartCount();
        }

        // Expose renderCartItems globally so it can be called after adding items
        window.renderCartItems = renderCartItems;

        function generateRatingStars(rating) {
            let stars = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;

            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fas fa-star"></i>';
            }

            if (hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            }

            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) {
                stars += '<i class="far fa-star"></i>';
            }

            return stars;
        }

        function updateCartSummary() {
            const subtotal = cartItems.reduce((total, item) => {
                const price = parseFloat(item.price.match(/\d+/)[0]);
                return total + (price * item.quantity);
            }, 0);

            const deliveryFee = subtotal > 2000 ? 0 : 200;
            const tax = subtotal * 0.13; // 13% tax

            document.querySelector('.subtotal').textContent = `Rs.${subtotal.toFixed(2)}`;
            document.querySelector('.delivery-fee').textContent = `Rs.${deliveryFee.toFixed(2)}`;
            document.querySelector('.tax').textContent = `Rs.${tax.toFixed(2)}`;
            document.querySelector('.total-amount').textContent = `Rs.${(subtotal + deliveryFee + tax).toFixed(2)}`;
        }

        // Event delegation for quantity buttons and remove buttons
        cartContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('minus') || e.target.parentElement.classList.contains('minus')) {
                const index = e.target.dataset.index || e.target.parentElement.dataset.index;
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                } else {
                    cartItems.splice(index, 1);
                }
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                renderCartItems();
            }

            if (e.target.classList.contains('plus') || e.target.parentElement.classList.contains('plus')) {
                const index = e.target.dataset.index || e.target.parentElement.dataset.index;
                cartItems[index].quantity++;
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                renderCartItems();
            }

            if (e.target.classList.contains('remove-item-btn') || e.target.parentElement.classList.contains('remove-item-btn')) {
                const index = e.target.dataset.index || e.target.parentElement.dataset.index;
                cartItems.splice(index, 1);
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                renderCartItems();
            }
        });

        // Handle "Proceed to Checkout" button click
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Redirect to login.html
                window.location.href = 'login.html';
            });
        }

        // Scroll to cart section if added from this page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('addedToCart')) {
            cartSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Initial render for cart page
        renderCartItems();
    }

    // Modal Functionality (shared across all pages)
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeSignupModal = document.getElementById('closeSignupModal');
    const switchToLogin = document.getElementById('switchToLogin');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.classList.add('show');
        });
    }

    if (signupBtn && signupModal) {
        signupBtn.addEventListener('click', function() {
            signupModal.classList.add('show');
        });
    }

    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', function() {
            loginModal.classList.remove('show');
        });
    }

    if (closeSignupModal && signupModal) {
        closeSignupModal.addEventListener('click', function() {
            signupModal.classList.remove('show');
        });
    }

    if (switchToLogin && signupModal && loginModal) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            signupModal.classList.remove('show');
            loginModal.classList.add('show');
        });
    }

    // Google Sign-In Callback (shared across all pages)
    window.onSignIn = function(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Email: ' + profile.getEmail());

        var id_token = googleUser.getAuthResponse().id_token;

        localStorage.setItem('user', JSON.stringify({
            name: profile.getName(),
            email: profile.getEmail(),
            id: profile.getId()
        }));

        if (loginModal) {
            loginModal.classList.remove('show');
        }
        window.location.href = 'checkout.html';
    };

    // Initial cart count update on page load (for all pages)
    updateCartCount();
});