#!/usr/bin/python3
from flask import Blueprint, request, session, jsonify
from backend.utils.auth import Auth


AUTH = Auth()

login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['POST'])
def login():
    """Login user and create session to keep track."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Validate login credentials
        user = AUTH.valid_login(email, password)
        if user:
            # Store the user ID in the session
            session['user_id'] = user.id
            return jsonify({"message": "Login successful", "user_id": user.id}), 200

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": "An error occurred during login"}), 500

@login_bp.route('/logout', methods=['POST'])
def logout():
    """Logs out the user by clearing the session."""
    session.pop('user_id', None)  # Remove user_id from session
    return jsonify({"message": "Logged out successfully"}), 200

@login_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({"authenticated": True}), 200
    return jsonify({"authenticated": False}), 200
