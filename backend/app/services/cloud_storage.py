from typing import BinaryIO, Optional
import boto3
from botocore.exceptions import ClientError
import os
from ..core.config import settings

class CloudStorageService:
    def __init__(self):
        """Initialize the cloud storage service with AWS S3 client."""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self.base_url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com"

    async def upload_file(self, file_obj: BinaryIO, object_name: str, content_type: str = None) -> str:
        """
        Upload a file to S3 bucket.
        
        Args:
            file_obj: File-like object to upload
            object_name: S3 object name (path in the bucket)
            content_type: Optional MIME type of the file
            
        Returns:
            str: Public URL of the uploaded file
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
                
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs=extra_args
            )
            return f"{self.base_url}/{object_name}"
        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")

    async def delete_file(self, object_name: str) -> bool:
        """
        Delete a file from S3 bucket.
        
        Args:
            object_name: S3 object name (path in the bucket)
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file: {str(e)}")

    async def generate_presigned_url(self, object_name: str, expires_in: int = 3600) -> str:
        """
        Generate a presigned URL for temporary access to a private file.
        
        Args:
            object_name: S3 object name (path in the bucket)
            expires_in: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Presigned URL
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_name
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

# Global instance for easy import
cloud_storage = CloudStorageService()
