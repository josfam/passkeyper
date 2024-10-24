#!/usr/bin/python3
from backend.models.password import PasswordEntry
from flask import Blueprint, Flask, jsonify, request, session, Response
import csv
import json
from io import StringIO
from werkzeug.utils import secure_filename


import_export_bp = Blueprint('import_export', __name__)


@import_export_bp.route('/import', methods=['POST'])
def import_data():
    return jsonify({"message": "Imported data successfuly!"}), 200


@import_export_bp.route('/export', methods=['GET'])
def export_data():
    """Exports user data as CSV/JSON"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        file_type = request.args.get('fileType', 'json')

        # Query user's password entries from the database
        data = PasswordEntry.query.filter(PasswordEntry.user_id == user_id).all()

        if file_type == 'json':
            # Manually convert SQLAlchemy objects to a dictionary
            data_list = [
                {
                    'name': item.name,
                    'username': item.username,
                    'password': item.password,
                    'url': item.url,
                    'favicon_url': item.favicon_url,
                    'notes': item.notes,
                    'created_at': item.created_at,
                    'updated_at': item.updated_at,
                }
                for item in data
            ]
            return jsonify(data_list)

        elif file_type == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            
            # Write CSV header based on your model fields
            writer.writerow(['name', 'username', 'password', 'url', 'favicon_url', 'notes', 'created_at', 'updated_at'])

            # Write data rows
            for item in data:
                writer.writerow([item.name, item.username, item.password, item.url, item.favicon_url, item.notes, item.created_at, item.updated_at])

            output.seek(0)
            return Response(output, mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=exported_data.csv"})

        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500
