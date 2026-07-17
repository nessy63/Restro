// Get the elements
const signupBtn = document.querySelector('.btn-signup');
const modal = document.getElementById('signupModal');
const closeBtn = document.querySelector('.close-btn');
const form = document.getElementById('signupForm');

// Open the modal when "Sign Up" is clicked
signupBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Close the modal when the "X" is clicked
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close the modal if the user clicks anywhere outside of the form box
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle the form submission (Simulation for now)
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevents the page from refreshing
    alert('Thanks for signing up! (Note: Connect to a database to save this)');
    modal.style.display = 'none'; // Close modal after submission
    form.reset(); // Clear the form inputs
});
// Grab the new Google button element
const googleBtn = document.getElementById('googleBtn');

// Handle Google Sign Up button click
googleBtn.addEventListener('click', () => {
    alert('Connecting securely to Google Accounts... 🚀');
    modal.style.display = 'none'; // Close the modal window
});

