#!/usr/bin/python3
from flask import Blueprint, jsonify

user_bp = Blueprint('user', __name__)

@user_bp.route('/user', methods=['GET'], strict_slashes=False)
def greet_user():
    return jsonify({"message": "Welcome user!"}), 200
