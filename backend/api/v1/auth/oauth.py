#!/usr/bin/python3

from flask import Blueprint, jsonify, redirect, request, session, url_for
from backend.models import oauth
from backend.models.user import User
from backend.utils.auth import Auth
from urllib.parse import urlencode
from dotenv import load_dotenv
import secrets
import traceback
import os

load_dotenv()
AUTH = Auth()

oauth_bp = Blueprint('oauth', __name__)


@oauth_bp.route('/google', methods=['GET'])
def google_login():
    """Login with google account"""
    # Generate a nonce (a random string)
    nonce = secrets.token_urlsafe(16)
        
    # Store nonce in session for later verification
    session['nonce'] = nonce

    # Redirect to Google for login and include the nonce
    redirect_uri = url_for('.callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri, nonce=nonce)


@oauth_bp.route('/callback')
def callback():
    """Redirect for google login"""
    try:
        token = oauth.google.authorize_access_token()  # Fetch the token
    
        # Retrieve the nonce from the session
        nonce = session.get('nonce')

        # Ensure that nonce is present (required for validation)
        if not nonce:
            return jsonify({"error": "Nonce not found in session"}), 400

        # Parse the ID token with the nonce for validation
        user_info = oauth.google.parse_id_token(token, nonce=nonce)  # Pass nonce

        # Extract email (and potentially other information like name)
        email = user_info.get('email')
        username = user_info.get('name', email)

        if not email:
            return jsonify({"error": "Google login failed: Email not available"}), 400
        
        # Check if the user already exists in the database
        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            # User exists, log them in
            session['user_id'] = existing_user.id
            # return redirect(f'{frontend_client}/passwords', code=200)
            return jsonify({"message": "Login successful", "user_id": existing_user.id}), 200

        # redirect to a frontend url, with the user info for this new user in the url params
        url_params = urlencode({
            "user_info": {"email": email, "username": username}
        })
        frontend_client = os.getenv('CLIENT_ADDRESS')
        return redirect(f'{frontend_client}/external-auth-password-creation?{url_params}', code=302)

    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        # print("Exception occurred:", traceback.format_exc())
        return jsonify({"error": "An error occurred during the authorization process"}), 500
