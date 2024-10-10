#!/usr/bin/python3
"""import models in every file where they are needed instead of individually"""

from flask_sqlalchemy import SQLAlchemy

# Placed here to avoid circular imports
db = SQLAlchemy()

from .user import User
from .password import PasswordEntry
from .user_session import UserSession
