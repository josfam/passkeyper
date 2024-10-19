#!/usr/bin/python3
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class Config:
    """Base Config Class"""
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI_STRING")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    SESSION_COOKIE_SAMESITE = 'None'  # Use 'Lax' if you only need first-party cookies
    SESSION_COOKIE_SECURE = True # change to false to allow http reqs via postman

    CLIENT_ADDRESS = os.getenv("CLIENT_ADDRESS")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
