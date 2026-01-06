from flask import Flask
import os

def create_app():
    # Get the root directory (parent of app/)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    app = Flask(
        __name__,
        template_folder=os.path.join(root_dir, 'templates'),
        static_folder=os.path.join(root_dir, 'static')
    )
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DATA_FILE'] = os.path.join(root_dir, 'data', 'problems.json')
    app.config['USERS_FILE'] = os.path.join(root_dir, 'data', 'users.json')
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(app.config['DATA_FILE']), exist_ok=True)
    
    from app.routes import bp
    from app.auth import auth_bp
    app.register_blueprint(bp)
    app.register_blueprint(auth_bp)
    
    return app

