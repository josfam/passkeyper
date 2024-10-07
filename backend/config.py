#!/usr/bin/python3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable cross-origin resource sharing
CORS(app)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('URI_STRING')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy
try:
    db = SQLAlchemy(app)
    print("Database connected successfully")
except Exception as e:
    print(f"Error connecting to the database: {e}")