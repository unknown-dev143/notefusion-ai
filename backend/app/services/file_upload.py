"""
File upload service for handling file uploads to cloud storage.
"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple
import aiofiles
from fastapi import UploadFile, HTTPException, status

class FileUploadService:
    """Service for handling file uploads and storage."""
    
    def __init__(self, upload_dir: str = "uploads"):
        """Initialize with upload directory."""
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def get_file_extension(self, filename: str) -> str:
        """Get file extension from filename."""
        return Path(filename).suffix.lower()
    
    def generate_unique_filename(self, original_filename: str) -> Tuple[str, str]:
        """Generate a unique filename with timestamp and UUID."""
        ext = self.get_file_extension(original_filename)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4().hex[:8])
        new_filename = f"{timestamp}_{unique_id}{ext}"
        return new_filename, ext[1:]  # Remove the dot from extension
    
    async def save_upload_file(self, file: UploadFile) -> dict:
        """Save uploaded file to the filesystem."""
        try:
            # Generate unique filename
            filename, file_ext = self.generate_unique_filename(file.filename)
            file_path = self.upload_dir / filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as buffer:
                content = await file.read()
                await buffer.write(content)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            return {
                "filename": file.filename,
                "saved_filename": filename,
                "file_path": str(file_path),
                "file_url": f"/uploads/{filename}",
                "file_type": file.content_type or f"application/{file_ext}",
                "file_size": file_size
            }
            
        except Exception as e:
            # Clean up if there was an error
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading file: {str(e)}"
            )

# Create a singleton instance
file_upload_service = FileUploadService()
