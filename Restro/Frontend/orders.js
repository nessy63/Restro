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

        // Request geolocation
        showNotification('Getting your location...', 'info');

        try {
            const position = await this.getLocation();
            const { latitude, longitude } = position.coords;

            // Reverse geocode to get address
            const address = await this.reverseGeocode(latitude, longitude);

            // Create order
            const order = {
                userId: Auth.getUser().id,
                userName: Auth.getUser().name,
                userEmail: Auth.getUser().email,
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
                date: new Date().toISOString()
            };

            // Save to database
            const orderId = await DB.add('orders', order);
            order.id = orderId;

            // Clear cart
            await DB.clearStore('cart');
            Cart.items = [];
            Cart.updateUI();

            // Close cart modal
            const cartModal = document.getElementById('cartModal');
            if (cartModal) cartModal.style.display = 'none';

            // Show order confirmation
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
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
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
                    <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Delivery Location:</strong></p>
                    <p class="location-text">${order.location.address}</p>
                    <p><strong>Coordinates:</strong> ${order.location.latitude.toFixed(6)}, ${order.location.longitude.toFixed(6)}</p>
                    <hr>
                    <p><strong>Items Ordered:</strong></p>
                    <ul class="order-items-list">
                        ${order.items.map(item => `<li>${item.name} x${item.quantity} - $${item.subtotal.toFixed(2)}</li>`).join('')}
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
                            <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
                        </div>
                        <p class="order-date">${new Date(order.date).toLocaleString()}</p>
                        <p class="order-total">Total: $${order.total.toFixed(2)}</p>
                        <p class="order-location">${order.location.address.substring(0, 60)}...</p>
                    </div>
                `).join('');
            }
        }

        if (modal) modal.style.display = 'flex';
    }
};
