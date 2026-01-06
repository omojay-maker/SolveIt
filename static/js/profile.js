// DOM elements
const userInfo = document.getElementById('userInfo');
const passwordForm = document.getElementById('passwordForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            displayUserInfo(user);
        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        userInfo.innerHTML = '<div class="error-message">Failed to load user information.</div>';
        console.error('Error:', error);
    }
}

// Display user info
function displayUserInfo(user) {
    userInfo.innerHTML = `
        <div class="user-detail-item">
            <span class="user-detail-label">Username:</span>
            <span class="user-detail-value">${escapeHtml(user.username)}</span>
        </div>
        <div class="user-detail-item">
            <span class="user-detail-label">Email:</span>
            <span class="user-detail-value">${escapeHtml(user.email)}</span>
        </div>
        <div class="user-detail-item">
            <span class="user-detail-label">Member Since:</span>
            <span class="user-detail-value">${formatDate(user.created_at)}</span>
        </div>
    `;
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(passwordForm);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/user/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        
        if (response.ok) {
            showMessage('Password changed successfully!', 'success');
            passwordForm.reset();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error logging out:', error);
        window.location.href = '/login';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message
function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    const targetSection = passwordForm ? passwordForm.closest('section') : document.body;
    if (targetSection) {
        targetSection.insertBefore(messageDiv, targetSection.firstChild.nextSibling);
    }
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

