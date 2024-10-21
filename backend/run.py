#!/usr/bin/python3
from backend.models import db
from backend.api.v1.app import create_app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
