#!/usr/bin/python3
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config import db


class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(120), unique=True, nullable=False)
    username = Column(String(80), unique=True, nullable=True)
    hashed_master_password = Column(String(255), nullable=False)
    ek_salt = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # One to many relationship
    # back_populates connects the two models to allow access in both directions
    # cascade='all, delete-orphan ensures if the user is deleted,
    # all their related sessions and password entries are deleted as well
    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
    password_entries = relationship(
        "PasswordEntry", back_populates="user", cascade="all, delete-orphan"
    )
