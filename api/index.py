import sys
import os

# Add backend directory to sys.path to resolve absolute imports like "from app.config import settings"
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
