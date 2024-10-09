#!/usr/bin/python3
from flask import Blueprint

# Import blueprints in this folder
from .register import register_bp

auth_bp = Blueprint("auth", __name__)

# Register individual blueprints for different routes
auth_bp.register_blueprint(register_bp)
