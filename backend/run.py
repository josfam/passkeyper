#!/usr/bin/python3
from backend.models import db
from backend.api.v1.app import create_app
from backend.models.user import User
from backend.models.user_session import UserSession
from backend.models.password import PasswordEntry


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
