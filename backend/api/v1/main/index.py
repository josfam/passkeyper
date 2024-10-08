#!/usr/bin/python3
from flask import Blueprint, jsonify

index_bp = Blueprint('index', __name__)

@index_bp.route('/', methods=['GET'], strict_slashes=False)
def index():
    return jsonify({"message": "Welcome to the API!"}), 200
