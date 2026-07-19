// Main application initialization and menu data

// ============================================================
// Security Utilities
// ============================================================
const Security = {
    // Generate cryptographically random nonce for Google Identity Services
    _nonce: null,

    getNonce() {
        if (!this._nonce) {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            this._nonce = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return this._nonce;
    },

    // Sanitize HTML to prevent XSS
    escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
        return str.replace(/[&<>"']/g, c => map[c]);
    }
};

const MENU_ITEMS = [
    { id: 1, name: "Momos", desc: "Steamed dumplings with spicy achar", price: 4.99, emoji: "&#127837;" },
    { id: 2, name: "Dal Bhat", desc: "Lentil soup with rice, pickles & veggies", price: 5.99, emoji: "&#127834;" },
    { id: 3, name: "Chow Mein", desc: "Stir-fried noodles with vegetables", price: 4.49, emoji: "&#127836;" },
    { id: 4, name: "Sel Roti", desc: "Traditional Nepali rice bread ring", price: 3.99, emoji: "&#127838;" },
    { id: 5, name: "Chatamari", desc: "Newari rice crepe with toppings", price: 5.49, emoji: "&#127839;" },
    { id: 6, name: "Thukpa", desc: "Tibetan-style noodle soup with chicken", price: 4.99, emoji: "&#127836;" },
    { id: 7, name: "Newari Khaja Set", desc: "Beaten rice, choyla, bar & achar", price: 6.99, emoji: "&#127834;" },
    { id: 8, name: "Sekuwa", desc: "Grilled marinated meat skewers", price: 5.99, emoji: "&#127830;" },
    { id: 9, name: "Gundruk", desc: "Fermented leafy greens with soup", price: 3.49, emoji: "&#129388;" },
    { id: 10, name: "Yomari", desc: "Sweet steamed dumpling with chaku", price: 3.99, emoji: "&#127847;" },
    { id: 11, name: "Bara", desc: "Lentil pancake, Newari style", price: 3.49, emoji: "&#127838;" },
    { id: 12, name: "Dhido & Saag", desc: "Millet dough with mustard greens", price: 4.49, emoji: "&#129388;" },
    { id: 13, name: "Kwati", desc: "Mixed bean soup, festive special", price: 4.99, emoji: "&#127834;" },
    { id: 14, name: "Aloo Tama", desc: "Potato & bamboo shoot curry", price: 3.99, emoji: "&#129365;" },
    { id: 15, name: "Mutton Curry", desc: "Slow-cooked goat meat in spices", price: 7.99, emoji: "&#127830;" },
    { id: 16, name: "Pork Choila", desc: "Spicy grilled pork with spices", price: 6.49, emoji: "&#127830;" },
    { id: 17, name: "Juju Dhau", desc: "Famous Bhaktapur creamy yogurt", price: 2.99, emoji: "&#129371;" },
    { id: 18, name: "Samosa (3pc)", desc: "Crispy pastry with spiced filling", price: 2.99, emoji: "&#127839;" },
    { id: 19, name: "Lassi", desc: "Traditional yogurt-based drink", price: 2.49, emoji: "&#129380;" },
    { id: 20, name: "Sikarni", desc: "Spiced yogurt with pepper & cumin", price: 2.99, emoji: "&#129371;" }
];

// Render menu grid with sanitized output
function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = MENU_ITEMS.map(item => `
        <div class="food-card">
            <div class="bowl-placeholder">${item.emoji}</div>
            <div class="card-content">
                <h3>${Security.escapeHTML(item.name)}</h3>
                <p>${Security.escapeHTML(item.desc)}</p>
                <div class="card-footer">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <button class="btn-add" data-item-id="${item.id}">&#128722;</button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach event listeners safely instead of inline onclick
    container.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const menuItem = MENU_ITEMS.find(m => m.id === itemId);
            if (menuItem) {
                Cart.addItem({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    image: ''
                });
            }
        });
    });
}

// Open modals
function openSignupModal() {
    document.getElementById('signupModal').style.display = 'flex';
}
function openSigninModal() {
    document.getElementById('signinModal').style.display = 'flex';
}

// Modal event listeners
function setupModals() {
    // Sign Up
    document.querySelector('.btn-signup').addEventListener('click', openSignupModal);
    document.getElementById('closeSignup').addEventListener('click', () => {
        document.getElementById('signupModal').style.display = 'none';
    });

    // Sign In
    document.querySelector('.btn-signin').addEventListener('click', openSigninModal);
    document.getElementById('closeSignin').addEventListener('click', () => {
        document.getElementById('signinModal').style.display = 'none';
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        const modals = ['signupModal', 'signinModal', 'cartModal', 'orderCheckoutModal', 'orderConfirmModal', 'orderHistoryModal', 'reservationModal', 'forgotModal', 'resetModal'];
        modals.forEach(id => {
            if (e.target === document.getElementById(id)) {
                document.getElementById(id).style.display = 'none';
            }
        });
    });

    // Cart icon click
    document.getElementById('cartIconBtn').addEventListener('click', () => {
        Cart.updateUI();
        document.getElementById('cartModal').style.display = 'flex';
    });

    // Close cart button
    document.getElementById('closeCartBtn').addEventListener('click', () => {
        document.getElementById('cartModal').style.display = 'none';
    });

    // Order history button
    document.getElementById('orderHistoryBtn').addEventListener('click', () => {
        Orders.showOrderHistory();
    });

    // Signout button
    document.getElementById('signoutBtn').addEventListener('click', () => {
        Auth.signout();
    });

    // Checkout confirmation modal close
    document.getElementById('closeCheckoutModal').addEventListener('click', () => {
        document.getElementById('orderCheckoutModal').style.display = 'none';
    });

    // Checkout confirmation form submit
    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await Orders.confirmOrder();
    });

    // Order confirmation close button
    document.getElementById('closeOrderConfirmBtn').addEventListener('click', () => {
        document.getElementById('orderConfirmModal').style.display = 'none';
    });

    // Order history close button
    document.getElementById('closeOrderHistoryBtn').addEventListener('click', () => {
        document.getElementById('orderHistoryModal').style.display = 'none';
    });

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in to place an order.', 'warning');
            return;
        }
        if (Cart.items.length === 0) {
            showNotification('Your cart is empty!', 'warning');
            return;
        }
        // Show phone + password confirmation modal
        Orders.showOrderConfirmModal();
    });

    // Discover menu button
    document.getElementById('discoverMenuBtn').addEventListener('click', () => {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = ['signupModal', 'signinModal', 'cartModal', 'orderCheckoutModal', 'orderConfirmModal', 'orderHistoryModal', 'reservationModal', 'forgotModal', 'resetModal'];
            modals.forEach(id => {
                const modal = document.getElementById(id);
                if (modal && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    });

    // Reservation modal
    document.getElementById('closeReservationModal').addEventListener('click', () => {
        document.getElementById('reservationModal').style.display = 'none';
    });
    document.getElementById('reservationModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('reservationModal')) {
            document.getElementById('reservationModal').style.display = 'none';
        }
    });
    document.getElementById('reservationForm').addEventListener('submit', (e) => {
        Tables.submitReservation(e);
    });

    // Hero Reserve a Table button
    document.querySelector('.hero-buttons .btn-secondary').addEventListener('click', () => {
        document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
    });

    // Backup data button
    document.getElementById('backupBtn').addEventListener('click', async () => {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in first.', 'warning');
            return;
        }
        try {
            const backup = await DB.exportBackup();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `restaurant-backup-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Backup downloaded successfully!', 'success');
        } catch (e) {
            showNotification('Backup failed: ' + e.message, 'error');
        }
    });

    // Restore data from file
    document.getElementById('restoreFileInput').addEventListener('change', async (e) => {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in first.', 'warning');
            e.target.value = '';
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('This will REPLACE all current data with the backup. Continue?')) {
            e.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            const imported = await DB.importBackup(backup);

            showNotification(
                `Restored! Users: ${imported.users}, Orders: ${imported.orders}, Cart: ${imported.cart}, Reservations: ${imported.reservations}`,
                'success'
            );

            // Refresh current session
            await Auth.init();
            Cart.init();
            Tables.renderTables();
        } catch (err) {
            showNotification('Restore failed: ' + err.message, 'error');
        }
        e.target.value = '';
    });

    // Sign Up form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;

        const result = await Auth.signup(name, email, password, phone);
        if (result.success) {
            showNotification(result.message, 'success');
            document.getElementById('signupModal').style.display = 'none';
            document.getElementById('signupForm').reset();
            Cart.init();
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Sign In form
    document.getElementById('signinForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailOrName = document.getElementById('signinEmailOrName').value;
        const password = document.getElementById('signinPassword').value;

        const result = await Auth.signin(emailOrName, password);
        if (result.success) {
            showNotification(result.message, 'success');
            document.getElementById('signinModal').style.display = 'none';
            document.getElementById('signinForm').reset();
            Cart.init();
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Forgot Password - open modal
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signinModal').style.display = 'none';
        document.getElementById('forgotModal').style.display = 'flex';
    });

    // Forgot Password - close modal
    document.getElementById('closeForgotModal').addEventListener('click', () => {
        document.getElementById('forgotModal').style.display = 'none';
    });

    // Forgot Password - find account form
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('forgotIdentifier').value;
        const result = await Auth.forgotPassword(identifier);

        if (result.success) {
            // Show account info and move to step 2
            let infoText = `Account found! `;
            if (result.maskedEmail) infoText += `Email: ${result.maskedEmail}`;
            if (result.maskedPhone) infoText += ` | Phone: ${result.maskedPhone}`;
            document.getElementById('resetAccountInfo').textContent = infoText;

            // Store userId for reset
            document.getElementById('resetForm').dataset.userId = result.userId;

            document.getElementById('forgotModal').style.display = 'none';
            document.getElementById('resetModal').style.display = 'flex';
            document.getElementById('forgotForm').reset();
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Reset Password - close modal
    document.getElementById('closeResetModal').addEventListener('click', () => {
        document.getElementById('resetModal').style.display = 'none';
    });

    // Reset Password - submit new password
    document.getElementById('resetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = parseInt(e.target.dataset.userId);
        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }

        const result = await Auth.resetPassword(userId, newPassword);
        if (result.success) {
            showNotification(result.message, 'success');
            document.getElementById('resetModal').style.display = 'none';
            document.getElementById('resetForm').reset();
            // Open sign-in so user can log in with new password
            document.getElementById('signinModal').style.display = 'flex';
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Google buttons
    document.getElementById('googleBtn').addEventListener('click', () => {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    showNotification('Google sign-in popup was blocked. Please allow popups or try again.', 'warning');
                }
            });
        } else {
            showNotification('Google sign-in is loading, please try again in a moment.', 'info');
        }
    });
    document.getElementById('googleSigninBtn').addEventListener('click', () => {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    showNotification('Google sign-in popup was blocked. Please allow popups or try again.', 'warning');
                }
            });
        } else {
            showNotification('Google sign-in is loading, please try again in a moment.', 'info');
        }
    });
}

// Detect user location on load
function detectLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                    { headers: { 'Accept': 'application/json' } }
                );
                const data = await response.json();
                const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                const shortAddress = address.split(',').slice(0, 3).join(',');
                document.getElementById('locationText').textContent = shortAddress;
                document.getElementById('locationBanner').style.display = 'block';
            } catch (e) {
                document.getElementById('locationText').textContent =
                    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                document.getElementById('locationBanner').style.display = 'block';
            }
        },
        () => {
            document.getElementById('locationText').textContent = 'Location access denied';
            document.getElementById('locationBanner').style.display = 'block';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ============================================================
// Google Identity Services (with nonce for CSRF protection)
// ============================================================
const GOOGLE_CLIENT_ID = CONFIG.GOOGLE_CLIENT_ID;

// ============================================================
// Table Reservation Module
// ============================================================
const Tables = {
    tables: [
        { id: 1, name: 'Table 1', seats: 2, type: 'Window Side' },
        { id: 2, name: 'Table 2', seats: 2, type: 'Window Side' },
        { id: 3, name: 'Table 3', seats: 4, type: 'Center' },
        { id: 4, name: 'Table 4', seats: 4, type: 'Center' },
        { id: 5, name: 'Table 5', seats: 6, type: 'Corner Booth' },
        { id: 6, name: 'Table 6', seats: 6, type: 'Corner Booth' }
    ],

    selectedTable: null,

    async getActiveReservations() {
        const all = await DB.getAll('reservations');
        const now = new Date();
        return all.filter(r => {
            if (r.status !== 'active') return false;
            const resDateTime = new Date(r.date + 'T' + r.time);
            return resDateTime > now;
        });
    },

    async renderTables() {
        const container = document.getElementById('tablesGrid');
        if (!container) return;

        const activeRes = await this.getActiveReservations();
        const bookedTableIds = new Set(activeRes.map(r => r.tableId));

        container.innerHTML = this.tables.map(t => {
            const isBooked = bookedTableIds.has(t.id);
            const statusClass = isBooked ? 'booked' : 'empty';
            const statusIcon = isBooked ? '&#10003;' : '&#10007;';
            const statusText = isBooked ? 'Reserved' : 'Available';
            const btnText = isBooked ? 'Cancel Reservation' : 'Reserve Now';

            return `
                <div class="table-card ${statusClass}" data-table-id="${t.id}">
                    <div class="table-status-icon">${statusIcon}</div>
                    <h3>${Security.escapeHTML(t.name)}</h3>
                    <p class="table-seats">${t.seats} Seats &bull; ${Security.escapeHTML(t.type)}</p>
                    <p class="table-status-text">${statusText}</p>
                    <button class="btn-reserve" data-table-id="${t.id}" data-booked="${isBooked}">${btnText}</button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.btn-reserve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tableId = parseInt(btn.dataset.tableId);
                const isBooked = btn.dataset.booked === 'true';
                if (isBooked) {
                    this.cancelReservation(tableId);
                } else {
                    this.openReservationModal(tableId);
                }
            });
        });
    },

    openReservationModal(tableId) {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in to reserve a table.', 'warning');
            openSigninModal();
            return;
        }

        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;

        this.selectedTable = table;
        document.getElementById('reservationTableLabel').textContent =
            `${table.name} - ${table.seats} Seats (${table.type})`;

        // Pre-fill name from logged-in user
        const user = Auth.getUser();
        if (user) {
            document.getElementById('resName').value = user.name || '';
            document.getElementById('resPhone').value = user.phone || '';
        }

        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('resDate').min = today;
        document.getElementById('resDate').value = today;
        document.getElementById('resTime').value = '19:00';

        document.getElementById('reservationModal').style.display = 'flex';
    },

    async submitReservation(e) {
        e.preventDefault();
        if (!this.selectedTable) return;

        const name = document.getElementById('resName').value.trim();
        const phone = document.getElementById('resPhone').value.trim();
        const date = document.getElementById('resDate').value;
        const time = document.getElementById('resTime').value;
        const guests = document.getElementById('resGuests').value;

        if (!name || !phone || !date || !time || !guests) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in to reserve a table.', 'warning');
            return;
        }

        // Check if table is already booked for that date+time
        const activeRes = await this.getActiveReservations();
        const conflict = activeRes.find(r =>
            r.tableId === this.selectedTable.id && r.date === date && r.time === time
        );
        if (conflict) {
            showNotification('This table is already reserved for that date and time.', 'error');
            return;
        }

        const reservation = {
            tableId: this.selectedTable.id,
            tableName: this.selectedTable.name,
            tableType: this.selectedTable.type,
            tableSeats: this.selectedTable.seats,
            userId: Auth.getUser().id,
            userName: name,
            userPhone: phone,
            userEmail: Auth.getUser().email,
            date: date,
            time: time,
            guests: parseInt(guests),
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await DB.add('reservations', reservation);

        document.getElementById('reservationModal').style.display = 'none';
        document.getElementById('reservationForm').reset();
        this.selectedTable = null;

        showNotification(`Table ${reservation.tableName} reserved successfully!`, 'success');
        this.renderTables();
    },

    async cancelReservation(tableId) {
        if (!Auth.isLoggedIn()) {
            showNotification('Please sign in.', 'warning');
            return;
        }

        const allRes = await DB.getAll('reservations');
        const activeRes = allRes.filter(r => r.tableId === tableId && r.status === 'active');

        if (activeRes.length === 0) return;

        for (const res of activeRes) {
            res.status = 'cancelled';
            await DB.update('reservations', res);
        }

        showNotification('Reservation cancelled.', 'info');
        this.renderTables();
    }
};

function initGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    const nonce = Security.getNonce();

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        nonce: nonce,
        use_fedcm_for_prompt: false
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignupContainer'),
        { theme: 'outline', size: 'large', text: 'signup_with', width: 300 }
    );
    google.accounts.id.renderButton(
        document.getElementById('googleSigninContainer'),
        { theme: 'outline', size: 'large', text: 'signin_with', width: 300 }
    );
}

// Callback after Google issues a JWT credential
async function handleGoogleCredential(response) {
    const result = await Auth.googleSignIn(response);
    if (result.success) {
        showNotification(result.message, 'success');
        document.getElementById('signupModal').style.display = 'none';
        document.getElementById('signinModal').style.display = 'none';
        Cart.init();
    } else {
        showNotification(result.message, 'error');
    }
}

// Initialize everything
async function initApp() {
    await DB.init();
    await Auth.init();
    await Cart.init();
    renderMenu();
    setupModals();
    detectLocation();
    initGoogleSignIn();
    Tables.renderTables();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
