// Cart module - manages shopping cart with IndexedDB persistence
const Cart = {
    items: [],

    async init() {
        if (Auth.isLoggedIn()) {
            await this.loadFromDB();
        }
        this.updateUI();
    },

    async loadFromDB() {
        if (!Auth.isLoggedIn()) return;
        const cartItems = await DB.getByIndex('cart', 'userId', Auth.getUser().id);
        this.items = cartItems.map(item => ({
            id: item.id,
            itemId: item.itemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));
    },

    async addItem(menuItem) {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in to add items to cart.', 'warning');
            openSigninModal();
            return;
        }

        const existingIndex = this.items.findIndex(i => i.itemId === menuItem.id);

        if (existingIndex >= 0) {
            this.items[existingIndex].quantity += 1;
            await DB.update('cart', {
                id: this.items[existingIndex].id,
                userId: Auth.getUser().id,
                itemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: this.items[existingIndex].quantity,
                image: menuItem.image
            });
        } else {
            const cartItem = {
                userId: Auth.getUser().id,
                itemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1,
                image: menuItem.image
            };
            const dbId = await DB.add('cart', cartItem);
            cartItem.id = dbId;
            this.items.push(cartItem);
        }

        this.updateUI();
        showNotification(Security.escapeHTML(menuItem.name) + ' added to cart!', 'success');
    },

    async removeItem(cartId) {
        const index = this.items.findIndex(i => i.id === cartId);
        if (index >= 0) {
            await DB.delete('cart', cartId);
            this.items.splice(index, 1);
            this.updateUI();
        }
    },

    async updateQuantity(cartId, newQty) {
        const item = this.items.find(i => i.id === cartId);
        if (!item) return;

        if (newQty <= 0) {
            await this.removeItem(cartId);
            return;
        }

        item.quantity = newQty;
        await DB.update('cart', {
            id: cartId,
            userId: Auth.getUser().id,
            itemId: item.itemId,
            name: item.name,
            price: item.price,
            quantity: newQty,
            image: item.image
        });
        this.updateUI();
    },

    async clear() {
        this.items = [];
        this.updateUI();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    updateUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartTotal = document.getElementById('cartTotal');
        const cartBadge = document.querySelector('.cart-badge');

        const count = this.getItemCount();
        if (cartCount) cartCount.textContent = count;
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }

        if (cartItemsList) {
            if (this.items.length === 0) {
                cartItemsList.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            } else {
                cartItemsList.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <span class="cart-item-name">${Security.escapeHTML(item.name)}</span>
                            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-action="decrement" data-id="${item.id}">-</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" data-action="increment" data-id="${item.id}">+</button>
                            <button class="remove-btn" data-action="remove" data-id="${item.id}">x</button>
                        </div>
                    </div>
                `).join('');

                // Attach event listeners safely
                cartItemsList.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = parseInt(btn.dataset.id);
                        const action = btn.dataset.action;
                        if (action === 'decrement') Cart.updateQuantity(id, Cart.items.find(i => i.id === id).quantity - 1);
                        else if (action === 'increment') Cart.updateQuantity(id, Cart.items.find(i => i.id === id).quantity + 1);
                        else if (action === 'remove') Cart.removeItem(id);
                    });
                });
            }
        }

        if (cartTotal) cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
    }
};
