#!/usr/bin/python3
from flask import Blueprint

# Import blueprints in this folder
from .signup import signup_bp
from .login import login_bp
from .oauth import oauth_bp

auth_bp = Blueprint("auth", __name__)

# Register individual blueprints for different routes
auth_bp.register_blueprint(signup_bp)
auth_bp.register_blueprint(login_bp)
auth_bp.register_blueprint(oauth_bp)
