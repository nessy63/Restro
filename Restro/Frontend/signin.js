const signinBtn = document.querySelector('.btn-signin');
const signinModal = document.getElementById('signinModal');
const closeSigninBtn = signinModal.querySelector('.close-btn');
const signinForm = document.getElementById('signinForm');
const googleSigninBtn = document.getElementById('googleSigninBtn');

// Open Sign In Modal
signinBtn.addEventListener('click', () => {
    signinModal.style.display = 'flex';
});

// Close Sign In Modal
closeSigninBtn.addEventListener('click', () => {
    signinModal.style.display = 'none';
});

// Submit Sign In Form
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Signed in successfully! Welcome back.');
    signinModal.style.display = 'none';
    signinForm.reset();
});

// Google Sign In
googleSigninBtn.addEventListener('click', () => {
    alert('Logging in with your Google Account... 🚀');
    signinModal.style.display = 'none';
});

// Close if clicking outside the modal box
window.addEventListener('click', (event) => {
    if (event.target === signinModal) {
        signinModal.style.display = 'none';
    }
});