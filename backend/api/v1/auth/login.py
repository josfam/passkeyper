#!/usr/bin/python3
from flask import Blueprint, request, session, jsonify
from werkzeug.security import check_password_hash
from backend.models.user import User
from backend.models import db


login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Verify the password
    if check_password_hash(user.hashed_master_password, password):
        # Store the user ID in the session
        session['user_id'] = user.id
        return jsonify({"message": "Login successful", "user_id": user.id}), 200

    return jsonify({"error": "Invalid credentials"}), 401


@login_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out the user by clearing the session"""
    session.pop('user_id', None)  # Remove user_id from session
    return jsonify({"message": "Logged out successfully"}), 200
