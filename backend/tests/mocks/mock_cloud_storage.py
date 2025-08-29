"""Mock cloud storage service for testing."""
from unittest.mock import AsyncMock, MagicMock
from typing import Optional, BinaryIO
import os

class MockCloudStorage:
    def __init__(self):
        self.upload_file = AsyncMock()
        self.delete_file = AsyncMock()
        self.get_presigned_url = AsyncMock()
        
        # Configure default return values
        self.upload_file.return_value = "http://example.com/mock-file.txt"
        self.delete_file.return_value = True
        self.get_presigned_url.return_value = "http://example.com/presigned-url"
    
    async def upload_file(
        self, 
        file: BinaryIO, 
        file_path: str, 
        content_type: Optional[str] = None,
        **kwargs
    ) -> str:
        """Mock file upload."""
        return await self.upload_file(file, file_path, content_type, **kwargs)
    
    async def delete_file(self, file_path: str) -> bool:
        """Mock file deletion."""
        return await self.delete_file(file_path)
    
    async def get_presigned_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Mock presigned URL generation."""
        return await self.get_presigned_url(file_path, expires_in)

# Create a fixture for the mock cloud storage
@pytest.fixture
def mock_cloud_storage():
    """Create a mock cloud storage instance."""
    return MockCloudStorage()

# Patch the cloud storage in the app
@pytest.fixture
def app_with_mock_storage(mock_cloud_storage):
    """Create an app with mocked cloud storage."""
    from app.main import app
    app.dependency_overrides[get_cloud_storage] = lambda: mock_cloud_storage
    yield app
    app.dependency_overrides.clear()
