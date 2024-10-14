#!/usr/bin/python3
"""
handling /passwords endpoints to
create, get(one or all), update,
move_to_trash a password
for only authenticated users
"""

from backend.models import db
from backend.models.password import PasswordEntry
from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import func

password_bp = Blueprint('password', __name__)


@password_bp.route('/password', methods=['POST'])
def create_a_password_entry():
    '''creates a new password entry'''
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
                        "Password entry created successfully. PassId: "
                        + str(new_password.id)}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error: " + str(e)}), 500


@password_bp.route('/password/<int:pass_ent_id>', methods=['GET'])
def get_a_password(pass_ent_id):
    '''retrieves a password entry by id'''
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Querying the db to retieve the password by id provided
    password_entry = PasswordEntry.query.filter_by(user_id=user_id,
                                                   id=pass_ent_id).first()

    if not password_entry:
        return jsonify(message="Password entry not found"), 404

    # Formatting the password entry
    pass_ent_data = {
        'name': password_entry.name,
        'username': password_entry.username,
        'password': password_entry.password,
        'url': password_entry.url,
        'notes': password_entry.notes
    }

    return jsonify(password=pass_ent_data), 200


@password_bp.route('/passwords', methods=['GET'])
def get_passwords():
    '''retrieves all the password entries of a certain user'''
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Pagination parameters: page and per_page with default int values
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Querying the db to retieve all passwords linked to the user
        passwords = PasswordEntry.query.filter_by(user_id=user_id,
                                                  in_trash=False)

        # Applying pagination using SQLAlchemy’s paginate feature --
        # error_out=False: Prevents an error if page num is too high
        # (e.g., requesting page 10 when only 5 pages exist)
        paginated_passes = passwords.paginate(page=page, per_page=per_page,
                                              error_out=False)

        # Format the passwords to return
        password_list = [
            {
                'name': password.name,
                'username': password.username,
                'password': password.password,
                'url': password.url,
                'notes': password.notes
            }
            for password in paginated_passes.items
        ]
        return jsonify({
            'passwords': password_list,
            'per_page': per_page,
            'has_next': paginated_passes.has_next,
            'has_prev': paginated_passes.has_prev
        }), 200
    except Exception as e:
        return jsonify({"error":
                        "An error occurred while retrieving passwords"}), 500


@password_bp.route('/password/<int:pass_ent_id>/trash', methods=['DELETE'])
def move_to_trash(pass_ent_id):
    """
    moves a password entry to trash
    """
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    password = PasswordEntry.query.filter_by(id=pass_ent_id, user_id=user_id,
                                             in_trash=False).first()

    if password is None:
        return jsonify({"error": "Password not found"}), 404

    try:
        # moving the pass entry to trash and updating moved_at
        password.in_trash = True
        password.moved_at = func.now()

        db.session.commit()

        return jsonify({"message":
                        "Password moved to trash successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":
                        "An error occurred while moving the password to trash"
                        }), 500


@password_bp.route('/password/<int:pass_ent_id>', methods=['PATCH'])
def update_a_password_entry(pass_ent_id):
    '''Updates a password entry by pass id'''
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Getting the data from the request body
    data = request.get_json()

    # Selecting the proper passwrod entry
    pass_entry = PasswordEntry.query.filter_by(id=pass_ent_id, user_id=user_id,
                                               in_trash=False).first()

    if not pass_entry:
        return jsonify({"error": "Password entry not found"}), 404

    # Determining updatable fields
    updatable_fields = ['password', 'name', 'username', 'url', 'notes']

    # Update the fields existing in the request data
    for field in updatable_fields:
        if field in data:
            setattr(pass_entry, field, data[field])

    # Update the timestamp
    pass_entry.updated_at = func.now()

    # Committing the changes to the database
    db.session.commit()

    return jsonify({"message": "Password entry updated successfully"}), 200
