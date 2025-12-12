"""Data Protection and Privacy Compliance System."""
import os
import json
import hashlib
import secrets
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import re
from pydantic import BaseModel, validator
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean

logger = logging.getLogger(__name__)

class DataProtectionConfig(BaseModel):
    """Data protection configuration."""
    encryption_enabled: bool = True
    data_retention_days: int = 365
    gdpr_compliance: bool = True
    anonymize_logs: bool = True
    mask_sensitive_data: bool = True
    backup_encryption: bool = True
    
    @validator('data_retention_days')
    def validate_retention_days(cls, v):
        if v < 30:
            raise ValueError('Data retention must be at least 30 days')
        return v

class DataEncryption:
    """Data encryption and decryption service."""
    
    def __init__(self, master_key: Optional[str] = None):
        if master_key:
            self.key = master_key.encode()
        else:
            self.key = os.environ.get('ENCRYPTION_KEY', self._generate_key())
        
        self.fernet = Fernet(self.key)
    
    def _generate_key(self) -> bytes:
        """Generate encryption key."""
        return Fernet.generate_key()
    
    def encrypt(self, data: str) -> str:
        """Encrypt data."""
        try:
            encrypted_data = self.fernet.encrypt(data.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data encryption failed"
            )
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt data."""
        try:
            decoded_data = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.fernet.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data decryption failed"
            )
    
    def encrypt_dict(self, data: Dict[str, Any]) -> str:
        """Encrypt dictionary data."""
        json_data = json.dumps(data)
        return self.encrypt(json_data)
    
    def decrypt_dict(self, encrypted_data: str) -> Dict[str, Any]:
        """Decrypt dictionary data."""
        json_data = self.decrypt(encrypted_data)
        return json.loads(json_data)

class DataMasking:
    """Data masking service for sensitive information."""
    
    def __init__(self):
        self.sensitive_patterns = {
            'email': r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            'phone': r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            'ssn': r'(\d{3})[-.\s]?(\d{2})[-.\s]?(\d{4})',
            'credit_card': r'(\d{4})[-.\s]?(\d{4})[-.\s]?(\d{4})[-.\s]?(\d{4})',
            'ip_address': r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})',
            'url': r'(https?://[^\s]+)',
            'api_key': r'([a-zA-Z0-9]{32,})',
            'password': r'(?i)password["\']?\s*[:=]\s*["\']?([^"\'\s]{8,})',
        }
    
    def mask_email(self, email: str) -> str:
        """Mask email address."""
        if '@' not in email:
            return email
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = '*' * len(local)
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        return f"{masked_local}@{domain}"
    
    def mask_phone(self, phone: str) -> str:
        """Mask phone number."""
        digits = re.sub(r'[^\d]', '', phone)
        if len(digits) >= 4:
            return phone.replace(digits[-4:], '*' * 4)
        return '*' * len(phone)
    
    def mask_ssn(self, ssn: str) -> str:
        """Mask Social Security Number."""
        digits = re.sub(r'[^\d]', '', ssn)
        if len(digits) == 9:
            return f"***-**-{digits[-4:]}"
        return '*' * len(ssn)
    
    def mask_credit_card(self, card: str) -> str:
        """Mask credit card number."""
        digits = re.sub(r'[^\d]', '', card)
        if len(digits) >= 4:
            return f"****-****-****-{digits[-4:]}"
        return '*' * len(card)
    
    def mask_ip_address(self, ip: str) -> str:
        """Mask IP address."""
        parts = ip.split('.')
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.***.***"
        return ip
    
    def mask_sensitive_data(self, data: str, mask_type: str = 'auto') -> str:
        """Automatically detect and mask sensitive data."""
        if mask_type == 'email':
            return self.mask_email(data)
        elif mask_type == 'phone':
            return self.mask_phone(data)
        elif mask_type == 'ssn':
            return self.mask_ssn(data)
        elif mask_type == 'credit_card':
            return self.mask_credit_card(data)
        elif mask_type == 'ip':
            return self.mask_ip_address(data)
        else:  # auto-detect
            masked_data = data
            
            # Check for email
            if re.search(self.sensitive_patterns['email'], data):
                masked_data = re.sub(
                    self.sensitive_patterns['email'],
                    lambda m: self.mask_email(m.group(0)),
                    masked_data
                )
            
            # Check for phone
            if re.search(self.sensitive_patterns['phone'], data):
                masked_data = re.sub(
                    self.sensitive_patterns['phone'],
                    lambda m: self.mask_phone(m.group(0)),
                    masked_data
                )
            
            # Check for SSN
            if re.search(self.sensitive_patterns['ssn'], data):
                masked_data = re.sub(
                    self.sensitive_patterns['ssn'],
                    lambda m: self.mask_ssn(m.group(0)),
                    masked_data
                )
            
            # Check for credit card
            if re.search(self.sensitive_patterns['credit_card'], data):
                masked_data = re.sub(
                    self.sensitive_patterns['credit_card'],
                    lambda m: self.mask_credit_card(m.group(0)),
                    masked_data
                )
            
            # Check for IP address
            if re.search(self.sensitive_patterns['ip_address'], data):
                masked_data = re.sub(
                    self.sensitive_patterns['ip_address'],
                    lambda m: self.mask_ip_address(m.group(0)),
                    masked_data
                )
            
            return masked_data

class GDPRCompliance:
    """GDPR compliance management."""
    
    def __init__(self, db: Session):
        self.db = db
        self.data_retention_days = 365
        self.anonymization_threshold_days = 90
    
    def generate_user_data_export(self, user_id: int) -> Dict[str, Any]:
        """Generate complete user data export (GDPR Article 20)."""
        try:
            # Collect all user data
            user_data = {
                "user_profile": self._get_user_profile(user_id),
                "notes": self._get_user_notes(user_id),
                "study_sessions": self._get_study_sessions(user_id),
                "quiz_results": self._get_quiz_results(user_id),
                "api_usage": self._get_api_usage(user_id),
                "security_logs": self._get_security_logs(user_id),
                "export_timestamp": datetime.utcnow().isoformat(),
                "data_types": self._get_data_types(user_id)
            }
            
            return user_data
            
        except Exception as e:
            logger.error(f"Failed to generate user data export: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to export user data"
            )
    
    def delete_user_data(self, user_id: int, verification_code: str) -> bool:
        """Delete all user data (GDPR Article 17 - Right to erasure)."""
        try:
            # Verify deletion request
            if not self._verify_deletion_request(user_id, verification_code):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid verification code"
                )
            
            # Delete user data in order
            self._delete_user_notes(user_id)
            self._delete_study_sessions(user_id)
            self._delete_quiz_results(user_id)
            self._delete_api_keys(user_id)
            self._delete_security_logs(user_id)
            self._delete_user_profile(user_id)
            
            # Log deletion
            self._log_data_deletion(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete user data: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user data"
            )
    
    def anonymize_inactive_users(self) -> int:
        """Anonymize users inactive for threshold period."""
        cutoff_date = datetime.utcnow() - timedelta(days=self.anonymization_threshold_days)
        
        try:
            # Find inactive users
            inactive_users = self._get_inactive_users(cutoff_date)
            anonymized_count = 0
            
            for user in inactive_users:
                self._anonymize_user_data(user.id)
                anonymized_count += 1
            
            logger.info(f"Anonymized {anonymized_count} inactive users")
            return anonymized_count
            
        except Exception as e:
            logger.error(f"Failed to anonymize inactive users: {e}")
            return 0
    
    def _get_user_profile(self, user_id: int) -> Dict[str, Any]:
        """Get user profile data."""
        # Implementation would query user profile
        return {}
    
    def _get_user_notes(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user notes data."""
        # Implementation would query user notes
        return []
    
    def _get_study_sessions(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user study sessions."""
        # Implementation would query study sessions
        return []
    
    def _get_quiz_results(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user quiz results."""
        # Implementation would query quiz results
        return []
    
    def _get_api_usage(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user API usage logs."""
        # Implementation would query API usage
        return []
    
    def _get_security_logs(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user security logs."""
        # Implementation would query security logs
        return []
    
    def _get_data_types(self, user_id: int) -> List[str]:
        """Get list of data types stored for user."""
        return ["profile", "notes", "study_sessions", "quiz_results", "api_usage", "security_logs"]
    
    def _verify_deletion_request(self, user_id: int, verification_code: str) -> bool:
        """Verify deletion request with code."""
        # Implementation would verify deletion request
        return True
    
    def _delete_user_notes(self, user_id: int):
        """Delete user notes."""
        pass
    
    def _delete_study_sessions(self, user_id: int):
        """Delete user study sessions."""
        pass
    
    def _delete_quiz_results(self, user_id: int):
        """Delete user quiz results."""
        pass
    
    def _delete_api_keys(self, user_id: int):
        """Delete user API keys."""
        pass
    
    def _delete_security_logs(self, user_id: int):
        """Delete user security logs."""
        pass
    
    def _delete_user_profile(self, user_id: int):
        """Delete user profile."""
        pass
    
    def _log_data_deletion(self, user_id: int):
        """Log data deletion event."""
        pass
    
    def _get_inactive_users(self, cutoff_date: datetime) -> List[Any]:
        """Get inactive users."""
        # Implementation would query inactive users
        return []
    
    def _anonymize_user_data(self, user_id: int):
        """Anonymize user data instead of deleting."""
        pass

class DataRetentionManager:
    """Data retention and cleanup management."""
    
    def __init__(self, db: Session):
        self.db = db
        self.retention_policies = {
            'user_logs': 90,      # days
            'api_logs': 30,       # days
            'security_logs': 365, # days
            'temp_files': 7,      # days
            'backups': 365,       # days
            'audit_logs': 1095    # days (3 years)
        }
    
    def cleanup_expired_data(self) -> Dict[str, int]:
        """Clean up expired data based on retention policies."""
        cleanup_results = {}
        
        for data_type, retention_days in self.retention_policies.items():
            try:
                deleted_count = self._cleanup_data_type(data_type, retention_days)
                cleanup_results[data_type] = deleted_count
                logger.info(f"Cleaned up {deleted_count} {data_type} records")
            except Exception as e:
                logger.error(f"Failed to cleanup {data_type}: {e}")
                cleanup_results[data_type] = 0
        
        return cleanup_results
    
    def _cleanup_data_type(self, data_type: str, retention_days: int) -> int:
        """Clean up specific data type."""
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        
        if data_type == 'user_logs':
            return self._cleanup_user_logs(cutoff_date)
        elif data_type == 'api_logs':
            return self._cleanup_api_logs(cutoff_date)
        elif data_type == 'security_logs':
            return self._cleanup_security_logs(cutoff_date)
        elif data_type == 'temp_files':
            return self._cleanup_temp_files(cutoff_date)
        elif data_type == 'backups':
            return self._cleanup_backups(cutoff_date)
        elif data_type == 'audit_logs':
            return self._cleanup_audit_logs(cutoff_date)
        
        return 0
    
    def _cleanup_user_logs(self, cutoff_date: datetime) -> int:
        """Clean up user activity logs."""
        # Implementation would delete old user logs
        return 0
    
    def _cleanup_api_logs(self, cutoff_date: datetime) -> int:
        """Clean up API request logs."""
        # Implementation would delete old API logs
        return 0
    
    def _cleanup_security_logs(self, cutoff_date: datetime) -> int:
        """Clean up security event logs."""
        # Implementation would delete old security logs
        return 0
    
    def _cleanup_temp_files(self, cutoff_date: datetime) -> int:
        """Clean up temporary files."""
        # Implementation would delete old temp files
        return 0
    
    def _cleanup_backups(self, cutoff_date: datetime) -> int:
        """Clean up old backups."""
        # Implementation would delete old backups
        return 0
    
    def _cleanup_audit_logs(self, cutoff_date: datetime) -> int:
        """Clean up audit logs."""
        # Implementation would delete old audit logs
        return 0

class DataProtectionService:
    """Main data protection service."""
    
    def __init__(self, db: Session, config: DataProtectionConfig):
        self.db = db
        self.config = config
        self.encryption = DataEncryption() if config.encryption_enabled else None
        self.masking = DataMasking()
        self.gdpr = GDPRCompliance(db) if config.gdpr_compliance else None
        self.retention = DataRetentionManager(db)
    
    def protect_sensitive_data(self, data: Union[str, Dict[str, Any]], 
                             operation: str = 'mask') -> Union[str, Dict[str, Any]]:
        """Protect sensitive data based on operation."""
        if isinstance(data, dict):
            return self._protect_dict(data, operation)
        else:
            return self._protect_string(data, operation)
    
    def _protect_string(self, data: str, operation: str) -> str:
        """Protect string data."""
        if operation == 'encrypt' and self.encryption:
            return self.encryption.encrypt(data)
        elif operation == 'mask' and self.config.mask_sensitive_data:
            return self.masking.mask_sensitive_data(data)
        else:
            return data
    
    def _protect_dict(self, data: Dict[str, Any], operation: str) -> Dict[str, Any]:
        """Protect dictionary data."""
        protected_data = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                # Check if key indicates sensitive data
                if any(keyword in key.lower() for keyword in 
                      ['password', 'email', 'phone', 'ssn', 'credit', 'api_key', 'token']):
                    protected_data[key] = self._protect_string(value, operation)
                else:
                    protected_data[key] = value
            elif isinstance(value, dict):
                protected_data[key] = self._protect_dict(value, operation)
            elif isinstance(value, list):
                protected_data[key] = [
                    self._protect_string(item, operation) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                protected_data[key] = value
        
        return protected_data
    
    def unprotect_data(self, protected_data: str) -> str:
        """Unprotect encrypted data."""
        if self.encryption:
            try:
                return self.encryption.decrypt(protected_data)
            except Exception:
                return protected_data
        return protected_data
    
    def log_data_access(self, user_id: int, data_type: str, action: str, 
                       metadata: Dict[str, Any] = None):
        """Log data access for audit purposes."""
        try:
            log_entry = {
                "user_id": user_id,
                "data_type": data_type,
                "action": action,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }
            
            # Mask sensitive data in logs if enabled
            if self.config.anonymize_logs:
                log_entry = self.masking.mask_sensitive_data(json.dumps(log_entry))
                log_entry = json.loads(log_entry)
            
            logger.info(f"Data access: {log_entry}")
            
        except Exception as e:
            logger.error(f"Failed to log data access: {e}")
    
    def run_data_cleanup(self) -> Dict[str, Any]:
        """Run scheduled data cleanup."""
        if not self.config.data_retention_days:
            return {"status": "disabled", "reason": "Data retention not configured"}
        
        try:
            cleanup_results = self.retention.cleanup_expired_data()
            
            # Run GDPR anonymization if enabled
            anonymized_count = 0
            if self.gdpr:
                anonymized_count = self.gdpr.anonymize_inactive_users()
            
            return {
                "status": "completed",
                "cleanup_results": cleanup_results,
                "anonymized_users": anonymized_count,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Data cleanup failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
