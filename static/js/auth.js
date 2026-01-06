// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        
        if (!username || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                window.location.href = '/';
            } else {
                const error = await response.json();
                showAlert(error.error || 'Login failed', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
            console.error('Error:', error);
        }
    });
}

// Handle signup form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const username = formData.get('username').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        
        if (!username || !email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            
            if (response.ok) {
                window.location.href = '/';
            } else {
                const error = await response.json();
                showAlert(error.error || 'Signup failed', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
            console.error('Error:', error);
        }
    });
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.querySelector('.auth-form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

