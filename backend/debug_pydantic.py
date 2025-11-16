import sys
import os
from fastapi import FastAPI

# Ensure the current directory is in the path to find 'schemas'
sys.path.append(os.path.dirname(__file__))

try:
    print("Attempting to import schemas...")
    from schemas import User
    print("Successfully imported 'User' from schemas.")

    app = FastAPI()

    @app.get("/test", response_model=User)
    def test_endpoint() -> User:
        """A dummy endpoint to test the User schema."""
        # This code won't actually run, but FastAPI will validate the schema on startup.
        return {
            "id": 1,
            "email": "test@example.com",
            "username": "testuser",
            "is_active": True,
            "is_admin": False,
            "created_at": "2025-01-01T00:00:00",
            "updated_at": "2025-01-01T00:00:00",
        }

    print("FastAPI app created successfully with the User schema.")
    print("If you see this message, the core issue is likely NOT in schemas.py.")

except Exception as e:
    print(f"An error occurred: {e}")
    import traceback
    traceback.print_exc()

