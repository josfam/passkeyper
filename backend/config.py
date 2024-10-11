#!/usr/bin/python3
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base Config Class"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY')
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI_STRING")
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
