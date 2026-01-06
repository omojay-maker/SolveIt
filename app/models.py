from datetime import datetime
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

class Problem:
    def __init__(self, problem, solution, problem_id=None, category=None):
        self.problem = problem
        self.solution = solution
        self.category = category or 'General'
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = self.timestamp
        self.id = problem_id or datetime.now().strftime("%Y%m%d%H%M%S%f")
    
    def update(self, problem=None, solution=None, category=None):
        """Update problem fields"""
        if problem is not None:
            self.problem = problem
        if solution is not None:
            self.solution = solution
        if category is not None:
            self.category = category
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def to_dict(self):
        return {
            'id': self.id,
            'problem': self.problem,
            'solution': self.solution,
            'category': self.category,
            'timestamp': self.timestamp,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        problem = cls(
            data['problem'], 
            data['solution'], 
            data.get('id'),
            data.get('category', 'General')
        )
        problem.timestamp = data.get('timestamp', problem.timestamp)
        problem.updated_at = data.get('updated_at', problem.timestamp)
        return problem


class ProblemStorage:
    def __init__(self, data_file):
        self.data_file = data_file
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Create data file if it doesn't exist"""
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump([], f)
    
    def save_problem(self, problem):
        """Save a problem to the storage"""
        problems = self.load_all_problems()
        problems.append(problem.to_dict())
        self._save_all_problems(problems)
        return problem
    
    def load_all_problems(self):
        """Load all problems from storage"""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def get_problem(self, problem_id):
        """Get a specific problem by ID"""
        problems = self.load_all_problems()
        for p in problems:
            if p.get('id') == problem_id:
                return Problem.from_dict(p)
        return None
    
    def delete_problem(self, problem_id):
        """Delete a problem by ID"""
        problems = self.load_all_problems()
        problems = [p for p in problems if p.get('id') != problem_id]
        self._save_all_problems(problems)
        return True
    
    def _save_all_problems(self, problems):
        """Save all problems to storage"""
        with open(self.data_file, 'w') as f:
            json.dump(problems, f, indent=2)
    
    def get_user_problems(self, user_id):
        """Get all problems for a specific user"""
        all_problems = self.load_all_problems()
        return [p for p in all_problems if p.get('user_id') == user_id]
    
    def save_user_problem(self, problem, user_id):
        """Save a problem for a specific user"""
        problems = self.load_all_problems()
        problem_dict = problem.to_dict()
        problem_dict['user_id'] = user_id
        problems.append(problem_dict)
        self._save_all_problems(problems)
        return problem
    
    def delete_user_problem(self, problem_id, user_id):
        """Delete a problem by ID if it belongs to the user"""
        problems = self.load_all_problems()
        original_count = len(problems)
        problems = [p for p in problems if not (p.get('id') == problem_id and p.get('user_id') == user_id)]
        if len(problems) < original_count:
            self._save_all_problems(problems)
            return True
        return False
    
    def update_user_problem(self, problem_id, user_id, problem_data):
        """Update a problem if it belongs to the user"""
        problems = self.load_all_problems()
        for i, p in enumerate(problems):
            if p.get('id') == problem_id and p.get('user_id') == user_id:
                problem = Problem.from_dict(p)
                problem.update(
                    problem=problem_data.get('problem'),
                    solution=problem_data.get('solution'),
                    category=problem_data.get('category')
                )
                # Update the dict in place
                problems[i] = problem.to_dict()
                problems[i]['user_id'] = user_id  # Preserve user_id
                self._save_all_problems(problems)
                return problem
        return None
    
    def get_user_statistics(self, user_id):
        """Get statistics for a user's problems"""
        problems = self.get_user_problems(user_id)
        total = len(problems)
        categories = {}
        for p in problems:
            cat = p.get('category', 'General')
            categories[cat] = categories.get(cat, 0) + 1
        
        return {
            'total_problems': total,
            'categories': categories,
            'total_categories': len(categories)
        }


class User:
    def __init__(self, username, email, password_hash=None, user_id=None):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.id = user_id or datetime.now().strftime("%Y%m%d%H%M%S%f")
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        user = cls(data['username'], data['email'], data.get('password_hash'), data.get('id'))
        user.created_at = data.get('created_at', user.created_at)
        return user


class UserStorage:
    def __init__(self, data_file):
        self.data_file = data_file
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Create data file if it doesn't exist"""
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump([], f)
    
    def save_user(self, user):
        """Save a user to the storage"""
        users = self.load_all_users()
        # Check if username or email already exists
        for u in users:
            if u.get('username') == user.username:
                raise ValueError('Username already exists')
            if u.get('email') == user.email:
                raise ValueError('Email already exists')
        
        users.append(user.to_dict())
        self._save_all_users(users)
        return user
    
    def load_all_users(self):
        """Load all users from storage"""
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def get_user_by_username(self, username):
        """Get a user by username"""
        users = self.load_all_users()
        for u in users:
            if u.get('username') == username:
                return User.from_dict(u)
        return None
    
    def get_user_by_email(self, email):
        """Get a user by email"""
        users = self.load_all_users()
        for u in users:
            if u.get('email') == email:
                return User.from_dict(u)
        return None
    
    def get_user_by_id(self, user_id):
        """Get a user by ID"""
        users = self.load_all_users()
        for u in users:
            if u.get('id') == user_id:
                return User.from_dict(u)
        return None
    
    def _save_all_users(self, users):
        """Save all users to storage"""
        with open(self.data_file, 'w') as f:
            json.dump(users, f, indent=2)

