#!/usr/bin/python3
"""Helper functions"""
from backend.models import oauth
from flask import request, session, jsonify


def check_session():
    """Check if user is logged in before accessing certain routes."""
    # List public routes that don't require authentication
    public_routes = ["/", "/login", "/signup", "/login/google", "/authorize/google", "/check-auth"]

    # Allow access to public routes or if user is logged in
    if request.path in public_routes or "user_id" in session:
        return None

    # Block access if user is not authenticated
    return jsonify({"error": "Unauthorized"}), 401


def register_google_oauth(app):
    """Register Google OAuth provider."""
    oauth.register(
        name='google',
        client_id=app.config['CLIENT_ID'],
        client_secret=app.config['CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid profile email'}
    )
