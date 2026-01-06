from flask import Blueprint, request, jsonify, render_template, current_app, session
from app.models import Problem, ProblemStorage
from app.auth import login_required

bp = Blueprint('main', __name__)

def get_storage():
    return ProblemStorage(current_app.config['DATA_FILE'])

@bp.route('/')
@login_required
def index():
    """Serve the main frontend page"""
    return render_template('index.html')

@bp.route('/api/problems', methods=['GET'])
@login_required
def get_problems():
    """Get all problems for the current user"""
    storage = get_storage()
    user_id = session.get('user_id')
    problems = storage.get_user_problems(user_id)
    return jsonify(problems)

@bp.route('/api/problems', methods=['POST'])
@login_required
def create_problem():
    """Create a new problem"""
    data = request.get_json()
    
    if not data or 'problem' not in data or 'solution' not in data:
        return jsonify({'error': 'Problem and solution are required'}), 400
    
    problem = Problem(
        data['problem'], 
        data['solution'],
        category=data.get('category', 'General')
    )
    storage = get_storage()
    user_id = session.get('user_id')
    storage.save_user_problem(problem, user_id)
    
    return jsonify(problem.to_dict()), 201

@bp.route('/api/problems/<problem_id>', methods=['GET'])
@login_required
def get_problem(problem_id):
    """Get a specific problem by ID"""
    storage = get_storage()
    user_id = session.get('user_id')
    problems = storage.get_user_problems(user_id)
    problem = next((p for p in problems if p.get('id') == problem_id), None)
    if problem:
        return jsonify(problem), 200
    return jsonify({'error': 'Problem not found'}), 404

@bp.route('/api/problems/<problem_id>', methods=['PUT'])
@login_required
def update_problem(problem_id):
    """Update a problem by ID"""
    data = request.get_json()
    storage = get_storage()
    user_id = session.get('user_id')
    
    problem = storage.update_user_problem(problem_id, user_id, data)
    if problem:
        return jsonify(problem.to_dict()), 200
    return jsonify({'error': 'Problem not found'}), 404

@bp.route('/api/problems/<problem_id>', methods=['DELETE'])
@login_required
def delete_problem(problem_id):
    """Delete a problem by ID"""
    storage = get_storage()
    user_id = session.get('user_id')
    if storage.delete_user_problem(problem_id, user_id):
        return jsonify({'message': 'Problem deleted successfully'}), 200
    return jsonify({'error': 'Problem not found'}), 404

@bp.route('/api/statistics', methods=['GET'])
@login_required
def get_statistics():
    """Get user statistics"""
    storage = get_storage()
    user_id = session.get('user_id')
    stats = storage.get_user_statistics(user_id)
    return jsonify(stats), 200

@bp.route('/api/export', methods=['GET'])
@login_required
def export_problems():
    """Export user's problems as JSON"""
    storage = get_storage()
    user_id = session.get('user_id')
    problems = storage.get_user_problems(user_id)
    
    from flask import Response
    import json
    
    return Response(
        json.dumps(problems, indent=2),
        mimetype='application/json',
        headers={'Content-Disposition': 'attachment; filename=problems_export.json'}
    )

