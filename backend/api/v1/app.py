#!/usr/bin/python3
from backend.config import DevelopmentConfig
from backend.models import db, migrate, cors, bcrypt, oauth
from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.utils.helpers import check_session, register_google_oauth
from . import v1_bp


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)

    # Apply configuration from config.py
    app.config.from_object(config_class)
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Use 'Lax' if you only need first-party cookies
    app.config['SESSION_COOKIE_SECURE'] = True # change to false to allow http reqs via postman

    # Initialize the database, migrate, cors, bcrypt & oauth
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={
        r"/*": {
            "origins": app.config['CLIENT_ADDRESS'],"methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            "supports_credentials": True
            # "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            # "expose_headers": ["Content-Type", "X-CSRFToken"],
            # "max_age": 3600,
            # "send_wildcard": False
        }
    })
    bcrypt.init_app(app)
    oauth.init_app(app)

    # Register Google OAuth provider
    register_google_oauth(app)

    # Register the v1 API blueprint
    app.register_blueprint(v1_bp)
    
    # Explicit OPTIONS handler for preflight requests
    # @app.route('/', methods=['OPTIONS'])
    # @app.route('/<path:path>', methods=['OPTIONS'])
    # def handle_options(path=None):
    #     """Handles preflight requests for all routes."""
    #     return '', 204

    # Apply session check globally
    @app.before_request
    def before_request():
        """Run before every request to check if the user is logged in."""
        if request.method != 'OPTIONS':  # Skip session check for OPTIONS
            return check_session()
        return None

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