#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate

import os

# Load environment variables
load_dotenv()

# Initialize SQLAlchemy & Flask-Migrate (without attaching it to the app)
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    CORS(app)

    # Configure the database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('DATABASE_URI_STRING')
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)
    
    # Initialize Flask-Migrate with the app and the db
    migrate.init_app(app, db)

    return app
