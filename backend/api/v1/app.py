#!/usr/bin/python3
from config import DevelopmentConfig
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate


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

    # Register Blueprints

    return app
