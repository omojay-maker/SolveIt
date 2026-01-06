// API base URL
const API_BASE = '/api/problems';

// State
let allProblems = [];
let editingProblemId = null;

// DOM elements
const problemForm = document.getElementById('problemForm');
const problemsContainer = document.getElementById('problemsContainer');
const refreshBtn = document.getElementById('refreshBtn');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModal = document.querySelector('.close-modal');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadStatistics();
    loadProblems();
    
    if (problemForm) {
        problemForm.addEventListener('submit', handleFormSubmit);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadProblems();
            loadStatistics();
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterProblems);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProblems);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', exportProblems);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
});

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            if (usernameDisplay) {
                usernameDisplay.textContent = `Welcome, ${user.username}!`;
            }
        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalProblems').textContent = stats.total_problems || 0;
            document.getElementById('totalCategories').textContent = stats.total_categories || 0;
            
            // Calculate problems this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const problems = allProblems.length > 0 ? allProblems : await fetch(API_BASE).then(r => r.json()).catch(() => []);
            const recentCount = problems.filter(p => new Date(p.timestamp) >= weekAgo).length;
            document.getElementById('recentProblems').textContent = recentCount;
            
            // Update category filter
            updateCategoryFilter(stats.categories || {});
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update category filter dropdown
function updateCategoryFilter(categories) {
    if (!categoryFilter) return;
    
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    Object.keys(categories).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = `${cat} (${categories[cat]})`;
        categoryFilter.appendChild(option);
    });
    
    categoryFilter.value = currentValue;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(problemForm);
    const problem = formData.get('problem').trim();
    const solution = formData.get('solution').trim();
    const category = formData.get('category');
    
    if (!problem || !solution) {
        showMessage('Please fill in both fields', 'error');
        return;
    }
    
    try {
        let response;
        if (editingProblemId) {
            // Update existing problem
            response = await fetch(`${API_BASE}/${editingProblemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ problem, solution, category })
            });
        } else {
            // Create new problem
            response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ problem, solution, category })
            });
        }
        
        if (response.ok) {
            showMessage(editingProblemId ? 'Problem updated successfully!' : 'Problem saved successfully!', 'success');
            problemForm.reset();
            cancelEdit();
            loadProblems();
            loadStatistics();
        } else if (response.status === 401) {
            window.location.href = '/login';
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to save problem', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Load all problems
async function loadProblems() {
    problemsContainer.innerHTML = '<div class="loading">Loading problems...</div>';
    
    try {
        const response = await fetch(API_BASE);
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        allProblems = await response.json();
        displayProblems(allProblems);
    } catch (error) {
        problemsContainer.innerHTML = '<div class="error-message">Failed to load problems. Please refresh the page.</div>';
        console.error('Error:', error);
    }
}

// Filter problems
function filterProblems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value;
    
    let filtered = allProblems;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.problem.toLowerCase().includes(searchTerm) ||
            p.solution.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryValue) {
        filtered = filtered.filter(p => p.category === categoryValue);
    }
    
    displayProblems(filtered);
}

// Display problems
function displayProblems(problems) {
    if (problems.length === 0) {
        problemsContainer.innerHTML = '<div class="empty-state show">No problems found. Add your first problem above!</div>';
        return;
    }
    
    // Sort by timestamp (newest first)
    problems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    problemsContainer.innerHTML = problems.map(problem => createProblemCard(problem)).join('');
    
    // Attach event handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const problemId = e.target.dataset.id;
            deleteProblem(problemId);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const problemId = e.target.dataset.id;
            openEditModal(problemId);
        });
    });
}

// Create problem card HTML
function createProblemCard(problem) {
    const isUpdated = problem.updated_at && problem.updated_at !== problem.timestamp;
    return `
        <div class="problem-card">
            <div class="problem-header">
                <div>
                    <span class="category-badge">${escapeHtml(problem.category || 'General')}</span>
                    <div class="problem-timestamp">
                        ${formatTimestamp(problem.timestamp)}
                        ${isUpdated ? ` (Updated: ${formatTimestamp(problem.updated_at)})` : ''}
                    </div>
                </div>
                <div class="problem-actions">
                    <button class="btn btn-edit" data-id="${problem.id}">Edit</button>
                    <button class="btn btn-danger btn-delete" data-id="${problem.id}">Delete</button>
                </div>
            </div>
            <div class="problem-content">
                <h3>Problem</h3>
                <p>${escapeHtml(problem.problem)}</p>
            </div>
            <div class="problem-content">
                <h3>Solution</h3>
                <p>${escapeHtml(problem.solution)}</p>
            </div>
        </div>
    `;
}

// Open edit modal
async function openEditModal(problemId) {
    try {
        const response = await fetch(`${API_BASE}/${problemId}`);
        if (response.ok) {
            const problem = await response.json();
            document.getElementById('editProblemId').value = problem.id;
            document.getElementById('editCategory').value = problem.category || 'General';
            document.getElementById('editProblem').value = problem.problem;
            document.getElementById('editSolution').value = problem.solution;
            editModal.classList.add('show');
        }
    } catch (error) {
        showMessage('Failed to load problem for editing', 'error');
        console.error('Error:', error);
    }
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('show');
    editForm.reset();
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const problemId = document.getElementById('editProblemId').value;
    const problem = document.getElementById('editProblem').value.trim();
    const solution = document.getElementById('editSolution').value.trim();
    const category = document.getElementById('editCategory').value;
    
    if (!problem || !solution) {
        showMessage('Please fill in both fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${problemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem, solution, category })
        });
        
        if (response.ok) {
            showMessage('Problem updated successfully!', 'success');
            closeEditModal();
            loadProblems();
            loadStatistics();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to update problem', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Start editing (inline)
function startEdit(problemId) {
    const problem = allProblems.find(p => p.id === problemId);
    if (!problem) return;
    
    editingProblemId = problemId;
    document.getElementById('problemId').value = problemId;
    document.getElementById('category').value = problem.category || 'General';
    document.getElementById('problem').value = problem.problem;
    document.getElementById('solution').value = problem.solution;
    formTitle.textContent = 'Edit Problem';
    submitBtn.textContent = 'Update Problem';
    cancelEditBtn.style.display = 'block';
    
    // Scroll to form
    document.querySelector('.problem-form').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit
function cancelEdit() {
    editingProblemId = null;
    document.getElementById('problemId').value = '';
    formTitle.textContent = 'Add New Problem';
    submitBtn.textContent = 'Save Problem';
    cancelEditBtn.style.display = 'none';
    problemForm.reset();
}

// Delete a problem
async function deleteProblem(problemId) {
    if (!confirm('Are you sure you want to delete this problem?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${problemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Problem deleted successfully', 'success');
            loadProblems();
            loadStatistics();
        } else {
            showMessage('Failed to delete problem', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Export problems
async function exportProblems() {
    try {
        const response = await fetch('/api/export');
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `problems_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showMessage('Problems exported successfully!', 'success');
        }
    } catch (error) {
        showMessage('Failed to export problems', 'error');
        console.error('Error:', error);
    }
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    // Insert at the top of the form or problems list
    if (type === 'error' || type === 'success') {
        const targetSection = problemForm ? problemForm.closest('section') : document.querySelector('.problems-list');
        if (targetSection) {
            targetSection.insertBefore(messageDiv, targetSection.firstChild.nextSibling);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
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
        // Redirect anyway
        window.location.href = '/login';
    }
}
