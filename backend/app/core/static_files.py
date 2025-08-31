"""Static files configuration."""
import os
from fastapi.staticfiles import StaticFiles
from pathlib import Path

def setup_static_files(app):
    """Configure static files serving."""
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Mount static files
    app.mount(
        "/static",
        StaticFiles(directory=str(upload_dir)),
        name="static"
    )
    
    # Add a route to serve the favicon
    favicon_path = Path("app/static/favicon.ico")
    if favicon_path.exists():
        @app.get("/favicon.ico", include_in_schema=False)
        async def favicon():
            from fastapi.responses import FileResponse
            return FileResponse(str(favicon_path))
