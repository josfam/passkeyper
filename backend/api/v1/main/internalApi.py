from flask import Blueprint, jsonify, request, abort, session
import os
from backend.models.user import User
internal_api = Blueprint('internal_api', __name__)
# Store token in environment variables
API_TOKEN = os.getenv('INTERNAL_API_TOKEN')
@internal_api.route('/internal/get-ek-salt', methods=['GET'])
def get_ek_salt():
    # Validate the request token
    if not is_internal_request(request):
        return abort(403)  # Forbidden for unauthorized users
    
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if user:
        return jsonify({'ek_salt': user.ek_salt, 'password': user.hashed_master_password, 'email': user.email}), 200
    else:
        return jsonify({"error": "User not found"}), 404
def is_internal_request(request):
    # Check for an authorization token in the request header
    request_token = request.headers.get('Authorization')
    # Validate the token
    if request_token == f"Bearer {API_TOKEN}":
        return True
    return False