#!/usr/bin/python3
from flask import Blueprint, jsonify, session, request
from backend.models.user import User
from sqlalchemy import func
from backend.models import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/user', methods=['GET'], strict_slashes=False)
def get_user():
    '''retrieving user data'''
    user_id = session.get('user_id')

    user = User.query.filter_by(id=user_id).first()

    if user:
        userData = {'name': user.username, 'email': user.email}
        return jsonify(userData), 200

    else:
        return jsonify({"error": "User not found"}), 404

@user_bp.route('/user', methods=["PATCH"], strict_slashes=False)
def update_user():
    '''update user data (name - email)'''
    user_id = session.get('user_id')
    
    data = request.get_json()

    user = User.query.filter_by(id=user_id).first()

    if user:
        if 'name' in data:
            user.username = data['name']
        if 'email' in data:
            user.email = data['email']

        user.updated_at = func.now()

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    else:
        return jsonify({"error": "User not found"}), 404
