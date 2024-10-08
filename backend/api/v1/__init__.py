from flask import Blueprint

# Import nested blueprint modules
from .main import main_bp


v1_bp = Blueprint('v1', __name__)

# Register nested the blueprints
v1_bp.register_blueprint(main_bp)
