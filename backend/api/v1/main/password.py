#!/usr/bin/python3
"""
handling /passwords endpoints to
retrieve, update, delete a/(all) password(s)
for only authenticated users
"""

from v1.app import db
from flask import Blueprint, jsonify, request, session, current_app
from models import PasswordEntry

password_bp = Blueprint('password', __name__)


@password_bp.route('/password', methods=['POST'])
def create_a_password_entry():
    # checking if a user is authenticated ((logged in)) -- available session
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Extracting data from the request sent
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    url = data.get('url')
    notes = data.get('notes')

    # validating required fields ((non-nullable ones))
    if not name or not username or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # creating a new pass entry
    new_password = PasswordEntry(
        user_id=user_id,
        name=name,
        username=username,
        password=password,
        url=url,
        notes=notes
    )

    try:
        db.session.add(new_password)
        db.session.commit()
        return jsonify({"message":
                        "Password entry created successfully."}), 201
    # except SQLAlchemyError as e:
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
