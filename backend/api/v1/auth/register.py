#!/usr/bin/python3
from flask import Blueprint, jsonify

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['GET'], strict_slashes=False)
def register():
    return jsonify({"message": "You are registered!"}), 200
