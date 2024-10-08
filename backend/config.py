#!/usr/bin/python3
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Base configuration class with default settings.
    Can be extended for specific environments.
    """

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')


class DevelopmentConfig(Config):
    """
    Enables debug mode and sets the database URI from environment variables.
    """

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI_STRING")
    DEBUG = True


class ProductionConfig(Config):
    """
    Disables debug mode for better performance and security.
    """

    DEBUG = False
