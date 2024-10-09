#!/usr/bin/python3
from backend.config import DevelopmentConfig
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from . import v1_bp


# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

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
