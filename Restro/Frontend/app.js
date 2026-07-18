// Main application initialization and menu data

const MENU_ITEMS = [
    { id: 1, name: "Classic Burger", desc: "Juicy beef patty with cheese & fries", price: 12.99, emoji: "&#127828;" },
    { id: 2, name: "Margherita Pizza", desc: "Fresh mozzarella, basil & tomato", price: 14.99, emoji: "&#127829;" },
    { id: 3, name: "Caesar Salad", desc: "Romaine lettuce, croutons & parmesan", price: 9.99, emoji: "&#129367;" },
    { id: 4, name: "Grilled Chicken", desc: "Herb-marinated chicken breast", price: 16.99, emoji: "&#127831;" },
    { id: 5, name: "Pasta Carbonara", desc: "Creamy sauce with bacon & parmesan", price: 13.99, emoji: "&#127837;" },
    { id: 6, name: "Sushi Platter", desc: "12 pcs assorted fresh sushi", price: 18.99, emoji: "&#127843;" },
    { id: 7, name: "Fish & Chips", desc: "Beer-battered cod with tartar sauce", price: 15.99, emoji: "&#127843;" },
    { id: 8, name: "Tacos (3pc)", desc: "Seasoned beef with salsa & guac", price: 11.99, emoji: "&#127790;" },
    { id: 9, name: "Steak Medium", desc: "250g ribeye with vegetables", price: 24.99, emoji: "&#129385;" },
    { id: 10, name: "Veggie Bowl", desc: "Quinoa, roasted veggies & hummus", price: 12.49, emoji: "&#129388;" },
    { id: 11, name: "Chicken Wings", desc: "Spicy buffalo wings (8 pcs)", price: 10.99, emoji: "&#127831;" },
    { id: 12, name: "Miso Ramen", desc: "Rich broth with noodles & pork", price: 13.49, emoji: "&#127836;" },
    { id: 13, name: "Club Sandwich", desc: "Triple-decker with turkey & bacon", price: 11.49, emoji: "&#129716;" },
    { id: 14, name: "Mushroom Risotto", desc: "Creamy arborio rice with truffle oil", price: 15.49, emoji: "&#127840;" },
    { id: 15, name: "Greek Salad", desc: "Feta, olives, cucumber & tomato", price: 10.49, emoji: "&#129367;" },
    { id: 16, name: "BBQ Ribs", desc: "Slow-cooked pork ribs with BBQ glaze", price: 19.99, emoji: "&#127830;" },
    { id: 17, name: "Pad Thai", desc: "Stir-fried rice noodles with shrimp", price: 13.99, emoji: "&#127837;" },
    { id: 18, name: "Chocolate Cake", desc: "Rich dark chocolate layer cake", price: 7.99, emoji: "&#127856;" },
    { id: 19, name: "Mango Smoothie", desc: "Fresh mango with yogurt & honey", price: 5.99, emoji: "&#129380;" },
    { id: 20, name: "Ice Cream (3 scoops)", desc: "Vanilla, chocolate & strawberry", price: 6.99, emoji: "&#127846;" }
];

// Render menu grid
function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = MENU_ITEMS.map(item => `
        <div class="food-card">
            <div class="bowl-placeholder">${item.emoji}</div>
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <div class="card-footer">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <button class="btn-add" onclick="Cart.addItem({id:${item.id}, name:'${item.name.replace(/'/g, "\\'")}', price:${item.price}, image:''})">&#128722;</button>
                </div>
            </div>
        </div>
    `).join('');
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
        if (e.target === document.getElementById('signupModal')) {
            document.getElementById('signupModal').style.display = 'none';
        }
        if (e.target === document.getElementById('signinModal')) {
            document.getElementById('signinModal').style.display = 'none';
        }
        if (e.target === document.getElementById('cartModal')) {
            document.getElementById('cartModal').style.display = 'none';
        }
        if (e.target === document.getElementById('orderConfirmModal')) {
            document.getElementById('orderConfirmModal').style.display = 'none';
        }
        if (e.target === document.getElementById('orderHistoryModal')) {
            document.getElementById('orderHistoryModal').style.display = 'none';
        }
    });

    // Sign Up form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        const result = await Auth.signup(name, email, password);
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

    // Google buttons — trigger Google Identity Services prompt
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
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
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
            // User denied location or error
            document.getElementById('locationText').textContent = 'Location access denied';
            document.getElementById('locationBanner').style.display = 'block';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ============================================================
// Google Identity Services
// ============================================================
// IMPORTANT: Replace YOUR_GOOGLE_CLIENT_ID below with your own.
// To get one:
//   1. Go to https://console.cloud.google.com/
//   2. Create a project (or select existing)
//   3. Go to APIs & Services > Credentials
//   4. Create OAuth 2.0 Client ID (Web application)
//   5. Add your domain to Authorized JavaScript origins
//      e.g. http://localhost:5500, http://127.0.0.1:5500
//   6. Copy the Client ID string
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

function initGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
        // GIS script not loaded yet, retry shortly
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    // Render hidden Google buttons (we trigger them via our own UI buttons)
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
        // Close any open auth modal
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
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
