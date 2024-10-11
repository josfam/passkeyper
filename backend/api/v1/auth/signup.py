#!/usr/bin/python3
from flask import Blueprint, request, jsonify
from backend.models.user import User
from backend.models import db


signup_bp = Blueprint('signup', __name__)


@signup_bp.route('/signup', methods=['POST'])
def signup():
    """create a user account and register entry in database"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')  # Store plain text password
    username = data.get('username')
    ek_salt = data.get('ek_salt')

    # Validate that required fields are present
    if not email or not password or not ek_salt:
        return jsonify({"error": "Email, password, and ek_salt are required"}), 400

    # Check if email is already registered
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 409

    # Create a new user (password stored as plain text)
    new_user = User(
        email=email, 
        hashed_master_password=password,  # Store the password directly (not hashed)
        ek_salt=ek_salt, 
        username=username
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201
