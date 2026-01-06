from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, flash, current_app
from app.models import User, UserStorage
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def get_user_storage():
    return UserStorage(current_app.config['USERS_FILE'])

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Check if it's an API request (JSON)
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required'}), 401
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and handler"""
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            if request.is_json:
                return jsonify({'error': 'Username and password are required'}), 400
            flash('Username and password are required', 'error')
            return render_template('login.html')
        
        storage = get_user_storage()
        user = storage.get_user_by_username(username)
        
        if not user or not user.check_password(password):
            if request.is_json:
                return jsonify({'error': 'Invalid username or password'}), 401
            flash('Invalid username or password', 'error')
            return render_template('login.html')
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        if request.is_json:
            return jsonify({'message': 'Login successful', 'user': {'id': user.id, 'username': user.username}}), 200
        return redirect(url_for('main.index'))
    
    return render_template('login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    """Signup page and handler"""
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not username or not email or not password:
            if request.is_json:
                return jsonify({'error': 'Username, email, and password are required'}), 400
            flash('All fields are required', 'error')
            return render_template('signup.html')
        
        if len(password) < 6:
            if request.is_json:
                return jsonify({'error': 'Password must be at least 6 characters'}), 400
            flash('Password must be at least 6 characters', 'error')
            return render_template('signup.html')
        
        user = User(username, email)
        user.set_password(password)
        
        storage = get_user_storage()
        try:
            storage.save_user(user)
            session['user_id'] = user.id
            session['username'] = user.username
            
            if request.is_json:
                return jsonify({'message': 'Signup successful', 'user': {'id': user.id, 'username': user.username}}), 201
            return redirect(url_for('main.index'))
        except ValueError as e:
            if request.is_json:
                return jsonify({'error': str(e)}), 400
            flash(str(e), 'error')
            return render_template('signup.html')
    
    return render_template('signup.html')

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout handler"""
    session.clear()
    if request.is_json:
        return jsonify({'message': 'Logout successful'}), 200
    return redirect(url_for('auth.login'))

@auth_bp.route('/api/user', methods=['GET'])
def get_current_user():
    """Get current logged-in user"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    storage = get_user_storage()
    user = storage.get_user_by_id(session['user_id'])
    
    if not user:
        session.clear()
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email, 'created_at': user.created_at}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def profile():
    """Profile page"""
    return render_template('profile.html')

@auth_bp.route('/api/user/password', methods=['PUT'])
@login_required
def change_password():
    """Change user password"""
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    storage = get_user_storage()
    user = storage.get_user_by_id(session['user_id'])
    
    if not user or not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    user.set_password(new_password)
    users = storage.load_all_users()
    for u in users:
        if u.get('id') == user.id:
            u['password_hash'] = user.password_hash
            break
    storage._save_all_users(users)
    
    return jsonify({'message': 'Password changed successfully'}), 200

