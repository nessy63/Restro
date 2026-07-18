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

    // Sign in with Google (receives JWT credential from Google Identity Services)
    async googleSignIn(jwtResponse) {
        try {
            // Decode the JWT payload (the middle part)
            const payload = JSON.parse(atob(jwtResponse.credential.split('.')[1]));

            const googleUser = {
                sub: payload.sub,              // Google's unique user ID
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                provider: 'google',
                createdAt: new Date().toISOString()
            };

            // Check if this Google user already exists in our DB
            let existingUser = await DB.getOneByIndex('users', 'email', googleUser.email);

            if (existingUser) {
                // User exists — update their Google info if needed
                existingUser.picture = googleUser.picture;
                existingUser.sub = googleUser.sub;
                existingUser.provider = 'google';
                await DB.update('users', existingUser);
                this.currentUser = existingUser;
            } else {
                // New user — save to DB
                const userId = await DB.add('users', googleUser);
                googleUser.id = userId;
                this.currentUser = googleUser;
            }

            localStorage.setItem('sessionId', this.currentUser.id);
            this.updateUI(true);
            return { success: true, message: `Welcome, ${this.currentUser.name}!`, user: this.currentUser };
        } catch (e) {
            console.error('Google sign-in error:', e);
            return { success: false, message: 'Google sign-in failed. Please try again.' };
        }
    },

    // Sign out
    signout() {
        this.currentUser = null;
        localStorage.removeItem('sessionId');
        // Also revoke Google session if applicable
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
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
                const iconEl = userGreeting.querySelector('.user-icon');
                const nameEl = userGreeting.querySelector('.user-name');
                // Show Google profile picture if available
                if (this.currentUser.picture && iconEl) {
                    iconEl.innerHTML = `<img src="${this.currentUser.picture}" alt="avatar" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`;
                }
                if (nameEl) nameEl.textContent = this.currentUser.name;
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
