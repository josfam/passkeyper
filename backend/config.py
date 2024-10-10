#!/usr/bin/python3
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base Config Class"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY')


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI_STRING")
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
