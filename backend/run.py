#!/usr/bin/python3
from api.v1.app import create_app, db
from models import User, PasswordEntry, UserSession


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
