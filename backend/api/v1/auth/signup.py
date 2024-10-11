#!/usr/bin/python3
from flask import Blueprint, request, jsonify
from backend.utils.auth import Auth


AUTH = Auth()

signup_bp = Blueprint('signup', __name__)


@signup_bp.route('/signup', methods=['POST'])
def signup():
    """Create a user account and register entry in database."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        ek_salt = data.get('ek_salt')

        # Validate that required fields are present
        if not email or not password or not ek_salt:
            return jsonify({"error": "Email, password, and ek_salt are required"}), 400
        
        new_user = AUTH.register_user(email, password, username, ek_salt)
        if new_user:
            return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201
        return jsonify({"error": "User could not be created"}), 500

    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        return jsonify({"error": "An error occurred during signup"}), 500
