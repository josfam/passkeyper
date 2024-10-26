#!/usr/bin/python3
"""Helper functions"""
from backend.models import oauth
from flask import request, session, jsonify


def check_session():
    """Check if user is logged in before accessing certain routes."""
    # List public routes that don't require authentication
    public_routes = ["/", "/login", "/signup", "/favicon.ico", "/check-auth", "/google", "/callback"]

    # Allow access to public routes or if user is logged in
    if request.path in public_routes or "user_id" in session:
        return None

    # Block access if user is not authenticated
    return jsonify({"error": "Unauthorized"}), 401


def register_google_oauth(app):
    """Register Google OAuth provider."""
     # Verify config values are loaded
    try:
        print("Initializing Google OAuth registration...")
        client_id = app.config.get('CLIENT_ID')
        client_secret = app.config.get('CLIENT_SECRET')
        
        if not client_id or not client_secret:
            raise KeyError("CLIENT_ID or CLIENT_SECRET missing in config.")

        oauth.register(
            name='google',
            client_id=client_id,
            client_secret=client_secret,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid profile email'}
        )
        print("Google OAuth registration completed successfully.")
    except KeyError as e:
        print(f"Missing OAuth configuration for: {str(e)}")
    except Exception as e:
        print(f"An error occurred during Google OAuth registration: {e}")
