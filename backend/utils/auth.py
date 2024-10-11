#!/usr/bin/python3
from backend.models.user import User
from backend.models import db, bcrypt
from sqlalchemy.orm.exc import NoResultFound


class Auth:
    """Auth class to handle authentication logic."""

    def __init__(self):
        pass

    def register_user(self, email, password, username, ek_salt):
        """Register a new user if the email doesn't exist."""
        try:
            # Check if the user already exists by email
            user = User.query.filter_by(email=email).first()
            if user:
                raise ValueError(f"User {email} already exists")

            # Hash the password using Flask-Bcrypt
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

            # Create a new user with the hashed password
            new_user = User(
                email=email,
                hashed_master_password=hashed_password,
                username=username,
                ek_salt=ek_salt
            )
            db.session.add(new_user)
            db.session.commit()
            return new_user

        except NoResultFound:
            return None


    def valid_login(self, email, password):
        """Validates login credentials."""
        try:
            # Find the user by email
            user = User.query.filter_by(email=email).first()
            if not user:
                return False

            # Verify the provided password against the hashed password
            if bcrypt.check_password_hash(user.hashed_master_password, password):
                return user

            return False
        except Exception:
            return False
