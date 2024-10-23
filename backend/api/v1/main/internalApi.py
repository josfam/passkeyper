from flask import Blueprint, jsonify, session
from backend.models.user import User

internal_api = Blueprint('internal_api', __name__)

@internal_api.route('/internal/get-ek-salt', methods=['GET'])
def get_ek_salt():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if user:
        return jsonify({'ek_salt': user.ek_salt, 'password': user.hashed_master_password}), 200
    else:
        return jsonify({"error": "User not found"}), 404