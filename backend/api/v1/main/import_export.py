#!/usr/bin/python3
from backend.models.password import PasswordEntry
from flask import Blueprint, Flask, jsonify, request, session, Response
from backend.models import db
import csv
import json
from io import StringIO


import_export_bp = Blueprint('import_export', __name__)


@import_export_bp.route('/import', methods=['POST'])
def import_data():
    """Imports user data as CSV/JSON"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file provided"}), 400

        file_type = request.form.get('fileType', 'json')
        file_content = file.read().decode('utf-8')

        if file_type == 'json':
            data = json.loads(file_content)
        elif file_type == 'csv':
            data = []
            csv_reader = csv.DictReader(StringIO(file_content))
            for row in csv_reader:
                data.append(row)
        else:
            return jsonify({"error": "Invalid file type"}), 400

        # Insert the data into the database
        for entry in data:
            new_entry = PasswordEntry(
                user_id=user_id,
                name=entry.get('name'),
                username=entry.get('username'),
                password=entry.get('password'),
                url=entry.get('url'),
                favicon_url=entry.get('favicon_url'),
                notes=entry.get('notes'),
                created_at=entry.get('created_at'),
                updated_at=entry.get('updated_at')
            )
            db.session.add(new_entry)

        db.session.commit()

        return jsonify({"message": "Data imported successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
