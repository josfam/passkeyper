#!/usr/bin/python3
from backend.config import DevelopmentConfig
from backend.models import db
from flask import Flask, jsonify, session, request
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.security import check_password_hash
from . import v1_bp


# Initialize extensions
migrate = Migrate()


def check_session():
    """Check if user is logged in before accessing certain routes."""
    # List public routes that don't require authentication
    public_routes = ["/login", "/signup"]

    # Allow access to public routes or if user is logged in
    if request.path in public_routes or "user_id" in session:
        return None  # Allow request to proceed

    # Block access if user is not authenticated
    return jsonify({"error": "Unauthorized"}), 401


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)

    CORS(app)

    # Apply configuration from config.py
    app.config.from_object(config_class)

    # Initialize the database and Flask-Migrate
    db.init_app(app)
    migrate.init_app(app, db)

    # Register the v1 API blueprint
    app.register_blueprint(v1_bp)

    # Apply session check globally
    @app.before_request
    def before_request():
        """Run before every request to check if the user is logged in."""
        return check_session()

    # Global error handlers
    @app.errorhandler(404)
    def page_not_found(error):
        """Handles 404 Not Found error globally"""
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        """Handles 500 Internal Server Error globally"""
        return jsonify({"error": "Internal server error"}), 500

    return app
