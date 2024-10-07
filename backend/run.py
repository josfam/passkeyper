#!/usr/bin/python3
from config import app, db
from models.user import User
from models.user_session import UserSession
from models.password import PasswordEntry

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)