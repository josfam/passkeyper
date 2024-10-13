#!/usr/bin/python3
"""import models in every file where they are needed instead of individually"""

from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# Placed here to avoid circular imports
db = SQLAlchemy()
bcrypt = Bcrypt()
cors = CORS()
migrate = Migrate()


from .user import User
from .password import PasswordEntry
from .user_session import UserSession
