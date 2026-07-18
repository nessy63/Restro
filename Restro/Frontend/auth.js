// Authentication module - manages signup, signin, sessions
const Auth = {
    currentUser: null,

    // Initialize: check for existing session
    async init() {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            try {
                const user = await DB.get('users', parseInt(sessionId));
                if (user) {
                    this.currentUser = user;
                    this.updateUI(true);
                    return;
                }
            } catch (e) { /* session expired */ }
        }
        this.updateUI(false);
    },

    // Sign up a new user
    async signup(name, email, password) {
        // Check if email already exists
        const existing = await DB.getOneByIndex('users', 'email', email);
        if (existing) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        // Basic password validation
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters.' };
        }

        const user = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password, // In production, hash this
            createdAt: new Date().toISOString()
        };

        const userId = await DB.add('users', user);
        user.id = userId;

        // Auto sign in after signup
        this.currentUser = user;
        localStorage.setItem('sessionId', userId);
        this.updateUI(true);

        return { success: true, message: 'Account created successfully!', user };
    },

    // Sign in existing user
    async signin(emailOrName, password) {
        let user = null;

        // Try by email first
        if (emailOrName.includes('@')) {
            user = await DB.getOneByIndex('users', 'email', emailOrName.trim().toLowerCase());
        }

        // If not found by email, try by name
        if (!user) {
            const users = await DB.getByIndex('users', 'name', emailOrName.trim());
            if (users.length > 0) {
                user = users[0]; // Take first match
            }
        }

        if (!user) {
            return { success: false, message: 'No account found with that name or email.' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Incorrect password.' };
        }

        // Sign in success
        this.currentUser = user;
        localStorage.setItem('sessionId', user.id);
        this.updateUI(true);

        return { success: true, message: `Welcome back, ${user.name}!`, user };
    },

    // Sign out
    signout() {
        this.currentUser = null;
        localStorage.removeItem('sessionId');
        this.updateUI(false);
        Cart.clear();
        showNotification('Signed out successfully.', 'info');
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    },

    // Get current user
    getUser() {
        return this.currentUser;
    },

    // Update the UI based on auth state
    updateUI(loggedIn) {
        const signupBtn = document.querySelector('.btn-signup');
        const signinBtn = document.querySelector('.btn-signin');
        const userGreeting = document.getElementById('userGreeting');
        const signoutBtn = document.getElementById('signoutBtn');

        if (loggedIn && this.currentUser) {
            if (signupBtn) signupBtn.style.display = 'none';
            if (signinBtn) signinBtn.style.display = 'none';
            if (userGreeting) {
                userGreeting.style.display = 'flex';
                userGreeting.querySelector('.user-name').textContent = this.currentUser.name;
            }
            if (signoutBtn) signoutBtn.style.display = 'block';
        } else {
            if (signupBtn) signupBtn.style.display = 'block';
            if (signinBtn) signinBtn.style.display = 'block';
            if (userGreeting) userGreeting.style.display = 'none';
            if (signoutBtn) signoutBtn.style.display = 'none';
        }
    }
};

// Notification helper
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
