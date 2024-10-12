#!/usr/bin/python3
"""
handling some trash page endpoints:
restore a password entry
delete one password permanently
deleting all passwords permanently
"""

from flask import Blueprint, jsonify, request, session
from ....models import PasswordEntry
from backend.api.v1.app import db
from sqlalchemy.sql import func

trash_bp = Blueprint('trash', __name__)


@trash_bp.route('/password/<int:pass_ent_id>/restore', methods=['PATCH'])
def restore_from_trash(pass_ent_id):
    """
    restores a password entry from the trash
    """
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    password = PasswordEntry.query.filter_by(id=pass_ent_id, user_id=user_id,
                                             in_trash=True).first()

    if password is None:
        return jsonify({"error": "Password not found"}), 404

    try:
        # restoring the pass entry from trash and updating moved_at and updated_at
        password.in_trash = False
        password.moved_at = None
        password.updated_at = func.now()

        db.session.commit()

        return jsonify({"message":
                        "Password restored successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":
                        "An error occurred while restoring the password"
                        }), 500


@trash_bp.route('/password/<int:pass_ent_id>', methods=['DELETE'])
def perm_del(pass_ent_id):
    """
    permanently deletes a password entry existing in trash
    """
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    password = PasswordEntry.query.filter_by(id=pass_ent_id, user_id=user_id,
                                             in_trash=True).first()

    if password is None:
        return jsonify({"error": "Password not found"}), 404

    try:
        # deleting pass entry permanently
        db.session.delete(password)
        db.session.commit()

        return jsonify({"message":
                        "Password deleted permanently"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":
                        "An error occurred while deleting the password"
                        }), 500


@trash_bp.route('/passwords', methods=['DELETE'])
def del_all():
    """
    deletes all passwords linked to a user that are in trash
    """
    # authenticating a user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    passwords = PasswordEntry.query.filter_by(user_id=user_id,
                                             in_trash=True).all()

    if not passwords:
        return jsonify({"error": "No passwords to delete"}), 404

    try:
        for password in passwords:
            db.session.delete(password)
        db.session.commit()

        return jsonify({"message":
                        "All passwords deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":
                        "An error occurred while deleting passwords"
                        }), 500
