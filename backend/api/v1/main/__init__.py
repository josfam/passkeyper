#!/usr/bin/python3
from flask import Blueprint

# Import blueprints in this folder
from .index import index_bp
from .user import user_bp
from .password import password_bp
from .trash import trash_bp
from .internalApi import internal_api

main_bp = Blueprint("main", __name__)

# Register individual blueprints for different routes
main_bp.register_blueprint(index_bp)
main_bp.register_blueprint(user_bp)
main_bp.register_blueprint(password_bp)
main_bp.register_blueprint(trash_bp)
main_bp.register_blueprint(internal_api)
