#!/usr/bin/python3
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    """Base Config Class"""
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI_STRING")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    SECRET_KEY = os.getenv('SECRET_KEY')
    CLIENT_ADDRESS = os.getenv("CLIENT_ADDRESS")
    CLIENT_ID = os.getenv('CLIENT_ID')
    CLIENT_SECRET = os.getenv('CLIENT_SECRET')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
