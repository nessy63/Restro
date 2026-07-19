// Authentication module - manages signup, signin, sessions
const Auth = {
    currentUser: null,
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    // Sanitize string to prevent XSS
    _sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Validate email format
    _isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate phone number format
    _isValidPhone(phone) {
        return /^\+?[\d\s\-()]{7,15}$/.test(phone);
    },

    // Hash password with SHA-256 + salt using Web Crypto API
    async _hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(salt + password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Generate random salt
    _generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Validate Google JWT claims
    _validateGoogleJWT(payload) {
        const now = Math.floor(Date.now() / 1000);

        if (!payload.exp || payload.exp < now) {
            throw new Error('Token has expired');
        }

        if (!payload.iat || payload.iat > now + 300) {
            throw new Error('Token issued at is in the future');
        }

        const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!validIssuers.includes(payload.iss)) {
            throw new Error('Invalid token issuer');
        }

        if (payload.aud !== GOOGLE_CLIENT_ID) {
            throw new Error('Token audience mismatch');
        }

        if (!payload.sub || !payload.email || !payload.name) {
            throw new Error('Token missing required fields');
        }

        if (payload.email_verified === false) {
            throw new Error('Google email not verified');
        }

        return true;
    },

    // Initialize: check for existing session
    async init() {
        const sessionData = localStorage.getItem('sessionData');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);

                if (Date.now() - session.timestamp > this.SESSION_DURATION) {
                    localStorage.removeItem('sessionData');
                    this.updateUI(false);
                    return;
                }

                const user = await DB.get('users', parseInt(session.userId));
                if (user) {
                    this.currentUser = user;
                    this.updateUI(true);
                    return;
                }
            } catch (e) {
                localStorage.removeItem('sessionData');
            }
        }
        this.updateUI(false);
    },

    // Store session with timestamp
    _storeSession(userId) {
        const session = {
            userId: userId,
            timestamp: Date.now()
        };
        localStorage.setItem('sessionData', JSON.stringify(session));
    },

    // Verify a password against the current user's stored hash
    async verifyPassword(password) {
        if (!this.currentUser) return false;
        const user = this.currentUser;

        if (!user.salt) {
            return user.password === password;
        }

        const hashedInput = await this._hashPassword(password, user.salt);
        return hashedInput === user.password;
    },

    // Update user phone number
    async updatePhone(phone) {
        if (!this.currentUser) return false;
        const trimmed = phone.trim();
        if (!this._isValidPhone(trimmed)) {
            return false;
        }
        this.currentUser.phone = trimmed;
        await DB.update('users', this.currentUser);
        return true;
    },

    // Sign up a new user
    async signup(name, email, password, phone) {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone ? phone.trim() : '';

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return { success: false, message: 'Name must be 2-50 characters.' };
        }

        if (!this._isValidEmail(trimmedEmail)) {
            return { success: false, message: 'Please enter a valid email address.' };
        }

        if (trimmedPhone && !this._isValidPhone(trimmedPhone)) {
            return { success: false, message: 'Please enter a valid phone number.' };
        }

        if (password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters.' };
        }
        if (!/[A-Z]/.test(password)) {
            return { success: false, message: 'Password must contain an uppercase letter.' };
        }
        if (!/[a-z]/.test(password)) {
            return { success: false, message: 'Password must contain a lowercase letter.' };
        }
        if (!/[0-9]/.test(password)) {
            return { success: false, message: 'Password must contain a number.' };
        }

        const existing = await DB.getOneByIndex('users', 'email', trimmedEmail);
        if (existing) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const salt = this._generateSalt();
        const hashedPassword = await this._hashPassword(password, salt);

        const user = {
            name: this._sanitize(trimmedName),
            email: trimmedEmail,
            password: hashedPassword,
            salt: salt,
            phone: trimmedPhone,
            createdAt: new Date().toISOString()
        };

        const userId = await DB.add('users', user);
        user.id = userId;

        this.currentUser = user;
        this._storeSession(userId);
        this.updateUI(true);

        return { success: true, message: 'Account created successfully!', user };
    },

    // Sign in existing user
    async signin(emailOrName, password) {
        let user = null;

        if (emailOrName.includes('@')) {
            user = await DB.getOneByIndex('users', 'email', emailOrName.trim().toLowerCase());
        }

        if (!user) {
            const users = await DB.getByIndex('users', 'name', emailOrName.trim());
            if (users.length > 0) {
                user = users[0];
            }
        }

        if (!user) {
            return { success: false, message: 'Invalid email/name or password.' };
        }

        if (!user.salt) {
            if (user.password !== password) {
                return { success: false, message: 'Invalid email/name or password.' };
            }
            const newSalt = this._generateSalt();
            user.salt = newSalt;
            user.password = await this._hashPassword(password, newSalt);
            await DB.update('users', user);
        } else {
            const hashedInput = await this._hashPassword(password, user.salt);
            if (hashedInput !== user.password) {
                return { success: false, message: 'Invalid email/name or password.' };
            }
        }

        this.currentUser = user;
        this._storeSession(user.id);
        this.updateUI(true);

        return { success: true, message: `Welcome back, ${user.name}!`, user };
    },

    // Sign in with Google
    async googleSignIn(jwtResponse) {
        try {
            const parts = jwtResponse.credential.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = JSON.parse(atob(parts[1]));
            this._validateGoogleJWT(payload);

            const googleUser = {
                sub: payload.sub,
                name: this._sanitize(payload.name),
                email: payload.email.toLowerCase(),
                picture: payload.picture,
                provider: 'google',
                phone: '',
                createdAt: new Date().toISOString()
            };

            let existingUser = await DB.getOneByIndex('users', 'email', googleUser.email);

            if (existingUser) {
                existingUser.picture = googleUser.picture;
                existingUser.sub = googleUser.sub;
                existingUser.provider = 'google';
                await DB.update('users', existingUser);
                this.currentUser = existingUser;
            } else {
                const userId = await DB.add('users', googleUser);
                googleUser.id = userId;
                this.currentUser = googleUser;
            }

            this._storeSession(this.currentUser.id);
            this.updateUI(true);
            return { success: true, message: `Welcome, ${this.currentUser.name}!`, user: this.currentUser };
        } catch (e) {
            console.error('Google sign-in error:', e.message);
            return { success: false, message: 'Google sign-in failed: ' + e.message };
        }
    },

    // Forgot password: look up user by email or phone
    async forgotPassword(identifier) {
        const trimmed = identifier.trim();
        if (!trimmed) {
            return { success: false, message: 'Please enter your email or phone number.' };
        }

        let user = null;

        if (trimmed.includes('@')) {
            user = await DB.getOneByIndex('users', 'email', trimmed.toLowerCase());
        } else {
            const cleaned = trimmed.replace(/[\s\-()]/g, '');
            const users = await DB.getAll('users');
            user = users.find(u => {
                if (!u.phone) return false;
                return u.phone.replace(/[\s\-()]/g, '') === cleaned;
            });
        }

        if (!user) {
            return { success: false, message: 'No account found with that email or phone.' };
        }

        // Return masked info so user can confirm it's their account
        const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
        const maskedPhone = user.phone ? user.phone.replace(/.{4}$/, '****') : null;

        return {
            success: true,
            message: 'Account found.',
            userId: user.id,
            maskedEmail,
            maskedPhone,
            hasPassword: !!user.salt || !!user.password
        };
    },

    // Reset password after identity verification
    async resetPassword(userId, newPassword) {
        const user = await DB.get('users', userId);
        if (!user) {
            return { success: false, message: 'Account not found.' };
        }

        if (newPassword.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters.' };
        }
        if (!/[A-Z]/.test(newPassword)) {
            return { success: false, message: 'Password must contain an uppercase letter.' };
        }
        if (!/[a-z]/.test(newPassword)) {
            return { success: false, message: 'Password must contain a lowercase letter.' };
        }
        if (!/[0-9]/.test(newPassword)) {
            return { success: false, message: 'Password must contain a number.' };
        }

        const salt = this._generateSalt();
        user.salt = salt;
        user.password = await this._hashPassword(newPassword, salt);
        await DB.update('users', user);

        return { success: true, message: 'Password reset successfully! You can now sign in.' };
    },

    // Sign out
    signout() {
        this.currentUser = null;
        localStorage.removeItem('sessionData');
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
                if (this.currentUser.picture && iconEl) {
                    iconEl.textContent = '';
                    const img = document.createElement('img');
                    img.src = this.currentUser.picture;
                    img.alt = 'avatar';
                    img.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;';
                    img.referrerPolicy = 'no-referrer';
                    img.onerror = () => { img.remove(); iconEl.textContent = '\u{1F464}'; };
                    iconEl.appendChild(img);
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

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
