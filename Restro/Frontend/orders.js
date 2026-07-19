// Orders module - handles order placement with geolocation
const Orders = {
    async placeOrder() {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in to place an order.', 'warning');
            return;
        }

        if (Cart.items.length === 0) {
            showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Show confirmation modal with phone + password fields
        this.showOrderConfirmModal();
    },

    showOrderConfirmModal() {
        const modal = document.getElementById('orderCheckoutModal');
        const phoneInput = document.getElementById('checkoutPhone');
        const passwordInput = document.getElementById('checkoutPassword');
        const savedPhone = Auth.getUser().phone || '';

        if (phoneInput) phoneInput.value = savedPhone;
        if (passwordInput) passwordInput.value = '';
        if (modal) modal.style.display = 'flex';
    },

    async confirmOrder() {
        const phone = document.getElementById('checkoutPhone').value.trim();
        const password = document.getElementById('checkoutPassword').value;
        const modal = document.getElementById('orderCheckoutModal');

        // Validate phone
        if (!phone) {
            showNotification('Phone number is required to place an order.', 'error');
            return;
        }

        if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
            showNotification('Please enter a valid phone number.', 'error');
            return;
        }

        // Verify password
        if (!password) {
            showNotification('Please enter your password to confirm the order.', 'error');
            return;
        }

        const valid = await Auth.verifyPassword(password);
        if (!valid) {
            showNotification('Incorrect password. Please try again.', 'error');
            return;
        }

        // Save phone to user profile
        await Auth.updatePhone(phone);

        // Close confirmation modal
        if (modal) modal.style.display = 'none';

        // Proceed with placing the order
        showNotification('Getting your location...', 'info');

        try {
            const position = await this.getLocation();
            const { latitude, longitude } = position.coords;
            const address = await this.reverseGeocode(latitude, longitude);

            const order = {
                userId: Auth.getUser().id,
                userName: Auth.getUser().name,
                userEmail: Auth.getUser().email,
                userPhone: phone,
                items: Cart.items.map(item => ({
                    itemId: item.itemId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity
                })),
                total: Cart.getTotal(),
                location: {
                    latitude: latitude,
                    longitude: longitude,
                    address: address
                },
                status: 'placed',
                statusUpdatedAt: new Date().toISOString(),
                date: new Date().toISOString()
            };

            const orderId = await DB.add('orders', order);
            order.id = orderId;

            await DB.clearStore('cart');
            Cart.items = [];
            Cart.updateUI();

            const cartModal = document.getElementById('cartModal');
            if (cartModal) cartModal.style.display = 'none';

            this.showOrderConfirmation(order);

            return order;
        } catch (error) {
            console.error('Order error:', error);
            showNotification('Could not get your location. Please allow location access and try again.', 'error');
        }
    },

    getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    },

    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                { headers: { 'Accept': 'application/json' } }
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        } catch (e) {
            return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }
    },

    async getUserOrders() {
        if (!Auth.isLoggedIn()) return [];
        return await DB.getByIndex('orders', 'userId', Auth.getUser().id);
    },

    showOrderConfirmation(order) {
        const modal = document.getElementById('orderConfirmModal');
        const details = document.getElementById('orderDetails');

        if (details) {
            details.innerHTML = `
                <div class="order-confirm-info">
                    <h3>Order #${order.id}</h3>
                    <p><strong>Status:</strong> <span class="status-badge status-${Security.escapeHTML(order.status)}">${Security.escapeHTML(order.status.toUpperCase())}</span></p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Phone:</strong> ${Security.escapeHTML(order.userPhone)}</p>
                    <p><strong>Delivery Location:</strong></p>
                    <p class="location-text">${Security.escapeHTML(order.location.address)}</p>
                    <p><strong>Coordinates:</strong> ${order.location.latitude.toFixed(6)}, ${order.location.longitude.toFixed(6)}</p>
                    <hr>
                    <p><strong>Items Ordered:</strong></p>
                    <ul class="order-items-list">
                        ${order.items.map(item => `<li>${Security.escapeHTML(item.name)} x${item.quantity} - $${item.subtotal.toFixed(2)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (modal) modal.style.display = 'flex';
    },

    async showOrderHistory() {
        const orders = await this.getUserOrders();
        const modal = document.getElementById('orderHistoryModal');
        const list = document.getElementById('orderHistoryList');

        if (list) {
            if (orders.length === 0) {
                list.innerHTML = '<p class="empty-cart">No orders yet.</p>';
            } else {
                list.innerHTML = orders.sort((a, b) => new Date(b.date) - new Date(a.date)).map(order => `
                    <div class="order-history-item">
                        <div class="order-history-header">
                            <span>Order #${order.id}</span>
                            <span class="status-badge status-${Security.escapeHTML(order.status)}">${Security.escapeHTML(order.status.toUpperCase())}</span>
                        </div>
                        <p class="order-date">${new Date(order.date).toLocaleString()}</p>
                        <p class="order-total">Total: $${order.total.toFixed(2)}</p>
                        <p class="order-location">Phone: ${Security.escapeHTML(order.userPhone || 'N/A')}</p>
                        <p class="order-location">${Security.escapeHTML(order.location.address.substring(0, 60))}...</p>
                    </div>
                `).join('');
            }
        }

        if (modal) modal.style.display = 'flex';
    }
};
