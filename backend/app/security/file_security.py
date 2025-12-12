"""File Security and Virus Scanning System."""
import os
import hashlib
import magic
import tempfile
import shutil
import logging
from typing import Dict, List, Optional, Any, Set, BinaryIO
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import mimetypes
import zipfile
import tarfile
import gzip
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
import subprocess
import json

logger = logging.getLogger(__name__)

class FileType(Enum):
    """File type categories."""
    DOCUMENT = "document"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    ARCHIVE = "archive"
    CODE = "code"
    EXECUTABLE = "executable"
    SCRIPT = "script"
    UNKNOWN = "unknown"

class ScanResult(Enum):
    """Virus scan results."""
    CLEAN = "clean"
    INFECTED = "infected"
    SUSPICIOUS = "suspicious"
    ERROR = "error"
    TIMEOUT = "timeout"

class ThreatLevel(Enum):
    """File threat levels."""
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class FileMetadata:
    """File metadata information."""
    filename: str
    file_type: FileType
    mime_type: str
    file_size: int
    file_hash: str
    created_at: datetime
    uploaded_by: Optional[int] = None
    is_scanned: bool = False
    scan_result: Optional[ScanResult] = None
    scan_timestamp: Optional[datetime] = None
    threat_level: ThreatLevel = ThreatLevel.SAFE
    quarantined: bool = False

@dataclass
class SecurityPolicy:
    """File security policy."""
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_extensions: Set[str] = None
    blocked_extensions: Set[str] = None
    allowed_mime_types: Set[str] = None
    blocked_mime_types: Set[str] = None
    require_scan: bool = True
    quarantine_suspicious: bool = True
    scan_executables: bool = True
    scan_archives: bool = True
    max_archive_depth: int = 10
    
    def __post_init__(self):
        if self.allowed_extensions is None:
            self.allowed_extensions = {
                '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
                '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
                '.mp4', '.avi', '.mov', '.wmv', '.flv',
                '.mp3', '.wav', '.ogg', '.flac',
                '.zip', '.tar', '.gz', '.7z',
                '.py', '.js', '.html', '.css', '.json', '.xml',
                '.csv', '.xlsx', '.pptx'
            }
        
        if self.blocked_extensions is None:
            self.blocked_extensions = {
                '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
                '.vbs', '.js', '.jar', '.app', '.deb', '.rpm',
                '.dmg', '.pkg', '.msi', '.msp', '.msm'
            }
        
        if self.allowed_mime_types is None:
            self.allowed_mime_types = {
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/csv',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/svg+xml',
                'video/mp4',
                'video/avi',
                'video/quicktime',
                'audio/mpeg',
                'audio/wav',
                'application/zip',
                'application/gzip',
                'application/json',
                'text/html',
                'text/css'
            }
        
        if self.blocked_mime_types is None:
            self.blocked_mime_types = {
                'application/x-executable',
                'application/x-msdownload',
                'application/x-msdos-program',
                'application/x-msshortcut',
                'application/x-sh',
                'application/x-bat',
                'application/x-cmd',
                'application/x-compressed',
                'application/x-mscompress'
            }

class VirusScanner:
    """Virus scanning interface."""
    
    def __init__(self, scanner_type: str = "clamav"):
        self.scanner_type = scanner_type
        self.scanner_path = self._find_scanner_path()
        self.temp_dir = tempfile.mkdtemp(prefix="security_scan_")
    
    def _find_scanner_path(self) -> Optional[str]:
        """Find virus scanner executable path."""
        scanners = {
            "clamav": ["clamscan", "clamdscan"],
            "windows_defender": ["MpCmdRun.exe"],
            "sophos": ["savscan"],
            "mcafee": ["scan"],
            "linux_maldet": ["maldet"]
        }
        
        for scanner_name in scanners.get(self.scanner_type, []):
            try:
                result = subprocess.run(
                    ["which", scanner_name],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    return result.stdout.strip()
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
        
        logger.warning(f"Virus scanner {self.scanner_type} not found")
        return None
    
    def scan_file(self, file_path: str) -> ScanResult:
        """Scan file for viruses."""
        if not self.scanner_path:
            logger.warning("No virus scanner available")
            return ScanResult.ERROR
        
        try:
            if self.scanner_type == "clamav":
                return self._scan_with_clamav(file_path)
            elif self.scanner_type == "windows_defender":
                return self._scan_with_windows_defender(file_path)
            else:
                logger.warning(f"Unsupported scanner: {self.scanner_type}")
                return ScanResult.ERROR
        
        except subprocess.TimeoutExpired:
            logger.error(f"Virus scan timeout for {file_path}")
            return ScanResult.TIMEOUT
        except Exception as e:
            logger.error(f"Virus scan error: {e}")
            return ScanResult.ERROR
    
    def _scan_with_clamav(self, file_path: str) -> ScanResult:
        """Scan with ClamAV."""
        try:
            result = subprocess.run(
                [self.scanner_path, "--no-summary", file_path],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                return ScanResult.CLEAN
            elif "FOUND" in result.stdout:
                logger.warning(f"Virus found in {file_path}: {result.stdout}")
                return ScanResult.INFECTED
            else:
                logger.error(f"ClamAV scan error: {result.stderr}")
                return ScanResult.ERROR
        
        except Exception as e:
            logger.error(f"ClamAV scan failed: {e}")
            return ScanResult.ERROR
    
    def _scan_with_windows_defender(self, file_path: str) -> ScanResult:
        """Scan with Windows Defender."""
        try:
            result = subprocess.run(
                [self.scanner_path, "-Scan", "-ScanType", "3", "-File", file_path],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                return ScanResult.CLEAN
            else:
                logger.warning(f"Windows Defender found threat: {result.stderr}")
                return ScanResult.INFECTED
        
        except Exception as e:
            logger.error(f"Windows Defender scan failed: {e}")
            return ScanResult.ERROR
    
    def cleanup(self):
        """Clean up temporary files."""
        try:
            shutil.rmtree(self.temp_dir, ignore_errors=True)
        except Exception as e:
            logger.error(f"Failed to cleanup temp directory: {e}")

class FileValidator:
    """File validation and analysis."""
    
    def __init__(self, policy: SecurityPolicy):
        self.policy = policy
        self.magic_mime = magic.Magic(mime=True)
        self.magic_type = magic.Magic()
    
    def validate_file(self, file: UploadFile) -> FileMetadata:
        """Validate uploaded file."""
        # Check file size
        if file.size > self.policy.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {self.policy.max_file_size} bytes"
            )
        
        # Get file extension
        file_ext = Path(file.filename).suffix.lower()
        
        # Check blocked extensions
        if file_ext in self.policy.blocked_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_ext} is not allowed"
            )
        
        # Check allowed extensions
        if self.policy.allowed_extensions and file_ext not in self.policy.allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_ext} is not in allowed list"
            )
        
        # Read file content for analysis
        file_content = file.file.read()
        file.file.seek(0)  # Reset file pointer
        
        # Detect actual MIME type
        actual_mime = self.magic_mime.from_buffer(file_content)
        
        # Check blocked MIME types
        if actual_mime in self.policy.blocked_mime_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File content type {actual_mime} is not allowed"
            )
        
        # Check allowed MIME types
        if self.policy.allowed_mime_types and actual_mime not in self.policy.allowed_mime_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File content type {actual_mime} is not in allowed list"
            )
        
        # Calculate file hash
        file_hash = self._calculate_hash(file_content)
        
        # Determine file type
        file_type = self._determine_file_type(file_ext, actual_mime)
        
        # Check for suspicious content
        self._check_suspicious_content(file_content, file_type)
        
        return FileMetadata(
            filename=file.filename,
            file_type=file_type,
            mime_type=actual_mime,
            file_size=file.size,
            file_hash=file_hash,
            created_at=datetime.utcnow()
        )
    
    def _calculate_hash(self, content: bytes) -> str:
        """Calculate SHA-256 hash of file content."""
        return hashlib.sha256(content).hexdigest()
    
    def _determine_file_type(self, extension: str, mime_type: str) -> FileType:
        """Determine file type category."""
        if mime_type.startswith('image/'):
            return FileType.IMAGE
        elif mime_type.startswith('video/'):
            return FileType.VIDEO
        elif mime_type.startswith('audio/'):
            return FileType.AUDIO
        elif mime_type.startswith('text/') or extension in ['.pdf', '.doc', '.docx']:
            return FileType.DOCUMENT
        elif mime_type in ['application/zip', 'application/gzip', 'application/x-tar']:
            return FileType.ARCHIVE
        elif extension in ['.py', '.js', '.html', '.css', '.json', '.xml']:
            return FileType.CODE
        elif mime_type in ['application/x-executable', 'application/x-msdownload']:
            return FileType.EXECUTABLE
        elif extension in ['.sh', '.bat', '.cmd', '.vbs']:
            return FileType.SCRIPT
        else:
            return FileType.UNKNOWN
    
    def _check_suspicious_content(self, content: bytes, file_type: FileType):
        """Check for suspicious file content."""
        content_str = content.decode('utf-8', errors='ignore')
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'eval\s*\(',
            r'exec\s*\(',
            r'system\s*\(',
            r'shell_exec\s*\(',
            r'passthru\s*\(',
            r'\.\./',
            r'\.\.\\',
            r'union\s+select',
            r'drop\s+table',
            r'delete\s+from'
        ]
        
        import re
        for pattern in suspicious_patterns:
            if re.search(pattern, content_str, re.IGNORECASE):
                logger.warning(f"Suspicious pattern detected in file: {pattern}")
                # Could raise exception or flag as suspicious
                break
        
        # Check for executable signatures
        if file_type == FileType.UNKNOWN and content.startswith(b'MZ'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Executable files are not allowed"
            )
    
    def scan_archive(self, file_path: str, max_depth: int = 5) -> List[FileMetadata]:
        """Scan archive files for embedded threats."""
        embedded_files = []
        
        try:
            if file_path.endswith('.zip'):
                with zipfile.ZipFile(file_path, 'r') as zip_file:
                    for file_info in zip_file.filelist:
                        if file_info.is_dir():
                            continue
                        
                        # Check depth
                        depth = file_info.filename.count('/')
                        if depth > max_depth:
                            logger.warning(f"Archive depth exceeded: {file_info.filename}")
                            continue
                        
                        # Extract and analyze file
                        try:
                            with zip_file.open(file_info) as embedded_file:
                                content = embedded_file.read()
                                embedded_meta = FileMetadata(
                                    filename=file_info.filename,
                                    file_type=self._determine_file_type(
                                        Path(file_info.filename).suffix,
                                        self.magic_mime.from_buffer(content)
                                    ),
                                    mime_type=self.magic_mime.from_buffer(content),
                                    file_size=len(content),
                                    file_hash=self._calculate_hash(content),
                                    created_at=datetime.utcnow()
                                )
                                embedded_files.append(embedded_meta)
                        except Exception as e:
                            logger.error(f"Error analyzing embedded file {file_info.filename}: {e}")
            
            elif file_path.endswith('.tar.gz') or file_path.endswith('.tgz'):
                with tarfile.open(file_path, 'r:gz') as tar_file:
                    for member in tar_file.getmembers():
                        if member.isfile():
                            depth = member.name.count('/')
                            if depth > max_depth:
                                continue
                            
                            try:
                                extracted_file = tar_file.extractfile(member)
                                if extracted_file:
                                    content = extracted_file.read()
                                    embedded_meta = FileMetadata(
                                        filename=member.name,
                                        file_type=self._determine_file_type(
                                            Path(member.name).suffix,
                                            self.magic_mime.from_buffer(content)
                                        ),
                                        mime_type=self.magic_mime.from_buffer(content),
                                        file_size=len(content),
                                        file_hash=self._calculate_hash(content),
                                        created_at=datetime.utcnow()
                                    )
                                    embedded_files.append(embedded_meta)
                            except Exception as e:
                                logger.error(f"Error analyzing embedded file {member.name}: {e}")
        
        except Exception as e:
            logger.error(f"Error scanning archive {file_path}: {e}")
        
        return embedded_files

class FileSecurityManager:
    """Main file security management service."""
    
    def __init__(self, db: Session, policy: SecurityPolicy = None):
        self.db = db
        self.policy = policy or SecurityPolicy()
        self.validator = FileValidator(self.policy)
        self.scanner = VirusScanner()
        self.quarantine_dir = tempfile.mkdtemp(prefix="quarantine_")
    
    async def process_upload(self, file: UploadFile, user_id: int = None) -> FileMetadata:
        """Process uploaded file with security checks."""
        try:
            # Validate file
            metadata = self.validator.validate_file(file)
            metadata.uploaded_by = user_id
            
            # Save to temporary location for scanning
            temp_path = os.path.join(tempfile.mkdtemp(), file.filename)
            with open(temp_path, 'wb') as temp_file:
                shutil.copyfileobj(file.file, temp_file)
            
            # Scan for viruses if required
            if self.policy.require_scan:
                scan_result = self.scanner.scan_file(temp_path)
                metadata.scan_result = scan_result
                metadata.scan_timestamp = datetime.utcnow()
                metadata.is_scanned = True
                
                if scan_result == ScanResult.INFECTED:
                    metadata.threat_level = ThreatLevel.CRITICAL
                    metadata.quarantined = True
                    await self._quarantine_file(temp_path, metadata)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File contains malicious content and has been quarantined"
                    )
                elif scan_result == ScanResult.SUSPICIOUS:
                    metadata.threat_level = ThreatLevel.HIGH
                    if self.policy.quarantine_suspicious:
                        metadata.quarantined = True
                        await self._quarantine_file(temp_path, metadata)
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="File appears suspicious and has been quarantined"
                        )
            
            # Scan archives if enabled
            if metadata.file_type == FileType.ARCHIVE and self.policy.scan_archives:
                embedded_files = self.validator.scan_archive(temp_path, self.policy.max_archive_depth)
                for embedded_file in embedded_files:
                    if embedded_file.file_type in [FileType.EXECUTABLE, FileType.SCRIPT]:
                        metadata.threat_level = ThreatLevel.HIGH
                        metadata.quarantined = True
                        await self._quarantine_file(temp_path, metadata)
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Archive contains executable files and has been quarantined"
                        )
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return metadata
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File processing error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="File processing failed"
            )
    
    async def _quarantine_file(self, file_path: str, metadata: FileMetadata):
        """Quarantine suspicious file."""
        try:
            quarantine_path = os.path.join(
                self.quarantine_dir,
                f"{metadata.file_hash}_{metadata.filename}"
            )
            shutil.move(file_path, quarantine_path)
            
            # Log quarantine event
            logger.warning(f"File quarantined: {metadata.filename} -> {quarantine_path}")
            
            # Store quarantine record in database
            # quarantine_record = QuarantineRecord(
            #     filename=metadata.filename,
            #     file_hash=metadata.file_hash,
            #     quarantine_path=quarantine_path,
            #     threat_level=metadata.threat_level.value,
            #     scan_result=metadata.scan_result.value if metadata.scan_result else None,
            #     quarantined_at=datetime.utcnow(),
            #     uploaded_by=metadata.uploaded_by
            # )
            # self.db.add(quarantine_record)
            # self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to quarantine file: {e}")
    
    def get_file_security_info(self, file_hash: str) -> Optional[FileMetadata]:
        """Get file security information."""
        # Query database for file metadata
        # file_record = self.db.query(FileRecord).filter(
        #     FileRecord.file_hash == file_hash
        # ).first()
        
        # if file_record:
        #     return FileMetadata(
        #         filename=file_record.filename,
        #         file_type=FileType(file_record.file_type),
        #         mime_type=file_record.mime_type,
        #         file_size=file_record.file_size,
        #         file_hash=file_record.file_hash,
        #         created_at=file_record.created_at,
        #         uploaded_by=file_record.uploaded_by,
        #         is_scanned=file_record.is_scanned,
        #         scan_result=ScanResult(file_record.scan_result) if file_record.scan_result else None,
        #         scan_timestamp=file_record.scan_timestamp,
        #         threat_level=ThreatLevel(file_record.threat_level),
        #         quarantined=file_record.quarantined
        #     )
        
        return None
    
    def scan_existing_file(self, file_path: str) -> ScanResult:
        """Scan existing file for threats."""
        return self.scanner.scan_file(file_path)
    
    def get_quarantine_summary(self) -> Dict[str, Any]:
        """Get quarantine summary."""
        try:
            quarantine_files = list(Path(self.quarantine_dir).glob("*"))
            
            threat_counts = {}
            total_files = len(quarantine_files)
            
            for file_path in quarantine_files:
                # Parse threat level from filename or database
                # For now, just count total files
                pass
            
            return {
                "total_quarantined": total_files,
                "threat_levels": threat_counts,
                "quarantine_directory": self.quarantine_dir
            }
        
        except Exception as e:
            logger.error(f"Failed to get quarantine summary: {e}")
            return {
                "total_quarantined": 0,
                "threat_levels": {},
                "error": str(e)
            }
    
    def release_from_quarantine(self, file_hash: str) -> bool:
        """Release file from quarantine."""
        try:
            # Find quarantined file
            quarantine_files = list(Path(self.quarantine_dir).glob(f"{file_hash}_*"))
            
            if not quarantine_files:
                return False
            
            # Move file back to regular storage
            # This would need proper destination handling
            for file_path in quarantine_files:
                # Update database record
                # quarantine_record = self.db.query(QuarantineRecord).filter(
                #     QuarantineRecord.file_hash == file_hash
                # ).first()
                
                # if quarantine_record:
                #     quarantine_record.released_at = datetime.utcnow()
                #     quarantine_record.released_by = current_user_id
                #     self.db.commit()
                
                # Remove from quarantine directory
                os.unlink(file_path)
            
            return True
        
        except Exception as e:
            logger.error(f"Failed to release file from quarantine: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources."""
        try:
            self.scanner.cleanup()
            shutil.rmtree(self.quarantine_dir, ignore_errors=True)
        except Exception as e:
            logger.error(f"Failed to cleanup file security manager: {e}")
    
    def get_security_statistics(self) -> Dict[str, Any]:
        """Get file security statistics."""
        try:
            stats = {
                "total_files_scanned": 0,
                "threats_detected": 0,
                "files_quarantined": 0,
                "scan_results": {
                    "clean": 0,
                    "infected": 0,
                    "suspicious": 0,
                    "error": 0
                },
                "threat_levels": {
                    "safe": 0,
                    "low": 0,
                    "medium": 0,
                    "high": 0,
                    "critical": 0
                }
            }
            
            # Query database for statistics
            # This would depend on your database schema
            
            return stats
        
        except Exception as e:
            logger.error(f"Failed to get security statistics: {e}")
            return {"error": str(e)}
