#!/usr/bin/python3
from backend.config import DevelopmentConfig
from backend.models import db, migrate, cors, bcrypt, oauth
from flask import Flask, jsonify
from flask_cors import CORS
from backend.utils.helpers import check_session, register_google_oauth
from . import v1_bp


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)

    # Apply configuration from config.py
    app.config.from_object(config_class)
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Use 'Lax' if you only need first-party cookies
    app.config['SESSION_COOKIE_SECURE'] = True

    # Initialize the database, migrate, cors, bcrypt & oauth
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/*": {"origins": app.config['CLIENT_ADDRESS'], "supports_credentials": True}})
    bcrypt.init_app(app)
    oauth.init_app(app)

    # Register Google OAuth provider
    register_google_oauth(app)

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
