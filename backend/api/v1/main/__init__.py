#!/usr/bin/python3
from flask import Blueprint

# Import blueprints in this folder
from .index import index_bp


main_bp = Blueprint("main", __name__)

# Register individual blueprints for different routes
main_bp.register_blueprint(index_bp)