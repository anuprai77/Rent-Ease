document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartCount = document.querySelector('.cart-count');
    
    // Update cart count in navbar
    function updateCartCount() {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
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
            // Corrected price parsing: Extract only the numeric part
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
    checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Redirect to login.html
        window.location.href = 'login.html';
    });
    
    // Initial render
    renderCartItems();
});