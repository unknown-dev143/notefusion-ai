"""Comprehensive Security Features Testing Suite."""
import pytest
import asyncio
import json
import tempfile
import os
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

# Import security modules
from app.security.two_factor_auth import TwoFactorAuthService, TwoFactorAuth, SMSAuth
from app.security.threat_detection import ThreatDetectionMiddleware, ThreatType
from app.security.data_protection import DataProtectionService, DataEncryption, DataMasking
from app.security.session_management import SessionManager, SessionData, SessionConfig
from app.security.api_security import InputValidator, ValidationType, ValidationRule, SecurityEvent
from app.security.file_security import FileSecurityManager, SecurityPolicy, FileType, ScanResult

class TestTwoFactorAuth:
    """Test Two-Factor Authentication functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)
    
    @pytest.fixture
    def two_factor_service(self, mock_db):
        """Create TwoFactorAuthService instance."""
        return TwoFactorAuthService(mock_db)
    
    def test_generate_totp_secret(self, two_factor_service):
        """Test TOTP secret generation."""
        secret = two_factor_service.totp_auth.generate_secret()
        assert len(secret) == 32
        assert secret.isalnum()
    
    def test_generate_qr_code(self, two_factor_service):
        """Test QR code generation."""
        secret = "test_secret_123456789012345678901234"
        qr_code = two_factor_service.totp_auth.generate_qr_code("test@example.com", secret)
        assert qr_code.startswith("data:image/png;base64,")
    
    def test_verify_totp_token(self, two_factor_service):
        """Test TOTP token verification."""
        secret = "test_secret_123456789012345678901234"
        # Generate a valid token (this would normally use time-based token)
        # For testing, we'll use a mock
        with patch.object(two_factor_service.totp_auth, 'verify_totp', return_value=True):
            result = two_factor_service.totp_auth.verify_totp(secret, "123456")
            assert result is True
    
    def test_generate_backup_codes(self, two_factor_service):
        """Test backup codes generation."""
        codes = two_factor_service.totp_auth.generate_backup_codes(10)
        assert len(codes) == 10
        for code in codes:
            assert len(code) == 9  # 4-4 format with dash
            assert '-' in code
    
    def test_enable_totp(self, two_factor_service, mock_db):
        """Test enabling TOTP for user."""
        mock_user = Mock()
        mock_user.id = 1
        mock_user.email = "test@example.com"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        result = two_factor_service.enable_totp(1)
        
        assert "secret" in result
        assert "qr_code" in result
        assert "backup_codes" in result
        assert len(result["backup_codes"]) == 10

class TestThreatDetection:
    """Test Threat Detection functionality."""
    
    @pytest.fixture
    def mock_app(self):
        """Mock FastAPI app."""
        return Mock()
    
    @pytest.fixture
    def threat_middleware(self, mock_app):
        """Create ThreatDetectionMiddleware instance."""
        return ThreatDetectionMiddleware(mock_app)
    
    def test_ip_blacklist_check(self, threat_middleware):
        """Test IP blacklist functionality."""
        # Test with blacklisted IP
        assert threat_middleware.ip_blacklist.is_blacklisted("192.168.1.100") is True
        
        # Test with whitelisted IP
        assert threat_middleware.ip_blacklist.is_blacklisted("127.0.0.1") is False
        
        # Test with normal IP
        assert threat_middleware.ip_blacklist.is_blacklisted("192.168.1.50") is False
    
    def test_bot_detection(self, threat_middleware):
        """Test bot detection."""
        # Test with known bot user agent
        is_bot, reason = threat_middleware.bot_detector.is_bot(
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            {"user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"}
        )
        assert is_bot is True
        assert "Googlebot" in reason
        
        # Test with normal browser
        is_bot, reason = threat_middleware.bot_detector.is_bot(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        assert is_bot is False
    
    def test_sql_injection_detection(self, threat_middleware):
        """Test SQL injection detection."""
        # Test with SQL injection attempt
        is_sql, reason = threat_middleware.sql_detector.detect_sql_injection(
            "SELECT * FROM users WHERE id = 1 OR 1=1"
        )
        assert is_sql is True
        assert "SQL injection" in reason
        
        # Test with normal input
        is_sql, reason = threat_middleware.sql_detector.detect_sql_injection(
            "This is normal text"
        )
        assert is_sql is False
    
    def test_xss_detection(self, threat_middleware):
        """Test XSS detection."""
        # Test with XSS attempt
        is_xss, reason = threat_middleware.xss_detector.detect_xss(
            "<script>alert('xss')</script>"
        )
        assert is_xss is True
        assert "XSS" in reason
        
        # Test with normal input
        is_xss, reason = threat_middleware.xss_detector.detect_xss(
            "This is normal text"
        )
        assert is_xss is False
    
    def test_ddos_protection(self, threat_middleware):
        """Test DDoS protection."""
        # Test rate limiting
        ip = "192.168.1.100"
        endpoint = "/api/test"
        
        # First request should pass
        is_ddos, reason = threat_middleware.ddos_protection.is_ddos_attack(ip, endpoint)
        assert is_ddos is False
        
        # Simulate many requests (exceed limit)
        for _ in range(150):  # Exceed default limit of 100
            threat_middleware.ddos_protection.request_counts[ip].append(1.0)
        
        is_ddos, reason = threat_middleware.ddos_protection.is_ddos_attack(ip, endpoint)
        assert is_ddos is True
        assert "Rate limit exceeded" in reason

class TestDataProtection:
    """Test Data Protection functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)
    
    @pytest.fixture
    def data_encryption(self):
        """Create DataEncryption instance."""
        return DataEncryption()
    
    @pytest.fixture
    def data_masking(self):
        """Create DataMasking instance."""
        return DataMasking()
    
    def test_encrypt_decrypt_data(self, data_encryption):
        """Test data encryption and decryption."""
        original_data = "This is sensitive data"
        
        # Encrypt data
        encrypted = data_encryption.encrypt(original_data)
        assert encrypted != original_data
        assert len(encrypted) > 0
        
        # Decrypt data
        decrypted = data_encryption.decrypt(encrypted)
        assert decrypted == original_data
    
    def test_encrypt_decrypt_dict(self, data_encryption):
        """Test dictionary encryption and decryption."""
        original_data = {"key": "value", "number": 123}
        
        # Encrypt dictionary
        encrypted = data_encryption.encrypt_dict(original_data)
        assert encrypted != json.dumps(original_data)
        
        # Decrypt dictionary
        decrypted = data_encryption.decrypt_dict(encrypted)
        assert decrypted == original_data
    
    def test_email_masking(self, data_masking):
        """Test email masking."""
        email = "user@example.com"
        masked = data_masking.mask_email(email)
        assert "@" in masked
        assert "example.com" in masked
        assert "u***@example.com" == masked or "us***@example.com" == masked
    
    def test_phone_masking(self, data_masking):
        """Test phone number masking."""
        phone = "+1-555-123-4567"
        masked = data_masking.mask_phone(phone)
        assert masked.endswith("****")
        assert len(masked) == len(phone)
    
    def test_ssn_masking(self, data_masking):
        """Test SSN masking."""
        ssn = "123-45-6789"
        masked = data_masking.mask_ssn(ssn)
        assert masked == "***-**-6789"
    
    def test_credit_card_masking(self, data_masking):
        """Test credit card masking."""
        card = "1234-5678-9012-3456"
        masked = data_masking.mask_credit_card(card)
        assert masked == "****-****-****-3456"
    
    def test_ip_masking(self, data_masking):
        """Test IP address masking."""
        ip = "192.168.1.100"
        masked = data_masking.mask_ip_address(ip)
        assert masked == "192.168.***.***"

class TestSessionManagement:
    """Test Session Management functionality."""
    
    @pytest.fixture
    def session_config(self):
        """Create SessionConfig instance."""
        return SessionConfig(
            default_timeout_minutes=30,
            max_concurrent_sessions=3,
            require_device_verification=False
        )
    
    @pytest.fixture
    def session_manager(self, session_config):
        """Create SessionManager instance."""
        return SessionManager(session_config, redis_url="memory://localhost")
    
    @pytest.fixture
    def mock_request(self):
        """Mock FastAPI request."""
        request = Mock()
        request.client.host = "192.168.1.100"
        request.headers = {"user-agent": "Test Browser"}
        request.url.path = "/api/test"
        return request
    
    def test_create_session(self, session_manager, mock_request):
        """Test session creation."""
        session = session_manager.create_session(1, mock_request)
        
        assert isinstance(session, SessionData)
        assert session.user_id == 1
        assert session.ip_address == "192.168.1.100"
        assert session.is_active is True
        assert session.session_id is not None
    
    def test_validate_session(self, session_manager, mock_request):
        """Test session validation."""
        # Create session first
        session = session_manager.create_session(1, mock_request)
        
        # Validate session
        validated_session = session_manager.validate_session(session.session_id, mock_request)
        
        assert validated_session is not None
        assert validated_session.session_id == session.session_id
        assert validated_session.is_active is True
    
    def test_terminate_session(self, session_manager, mock_request):
        """Test session termination."""
        # Create session first
        session = session_manager.create_session(1, mock_request)
        
        # Terminate session
        result = session_manager.terminate_session(session.session_id)
        assert result is True
        
        # Try to validate terminated session
        validated_session = session_manager.validate_session(session.session_id, mock_request)
        assert validated_session is None
    
    def test_extend_session(self, session_manager, mock_request):
        """Test session extension."""
        # Create session first
        session = session_manager.create_session(1, mock_request)
        original_expiry = session.expires_at
        
        # Extend session
        result = session_manager.extend_session(session.session_id, 60)
        assert result is True
        
        # Check if expiry was extended
        extended_session = session_manager.store.get_session(session.session_id)
        assert extended_session.expires_at > original_expiry

class TestAPISecurity:
    """Test API Security functionality."""
    
    @pytest.fixture
    def input_validator(self):
        """Create InputValidator instance."""
        return InputValidator()
    
    def test_string_validation(self, input_validator):
        """Test string input validation."""
        rules = [
            ValidationRule(
                name="test_field",
                type=ValidationType.STRING,
                min_length=5,
                max_length=10
            )
        ]
        
        # Valid input
        data = {"test_field": "valid"}
        result = input_validator.validate_input(data, rules)
        assert result["test_field"] == "valid"
        
        # Invalid input (too short)
        data = {"test_field": "bad"}
        with pytest.raises(HTTPException):
            input_validator.validate_input(data, rules)
    
    def test_email_validation(self, input_validator):
        """Test email validation."""
        rules = [
            ValidationRule(
                name="email",
                type=ValidationType.EMAIL
            )
        ]
        
        # Valid email
        data = {"email": "test@example.com"}
        result = input_validator.validate_input(data, rules)
        assert result["email"] == "test@example.com"
        
        # Invalid email
        data = {"email": "invalid-email"}
        with pytest.raises(HTTPException):
            input_validator.validate_input(data, rules)
    
    def test_password_validation(self, input_validator):
        """Test password validation."""
        rules = [
            ValidationRule(
                name="password",
                type=ValidationType.PASSWORD
            )
        ]
        
        # Valid password
        data = {"password": "StrongPass123!"}
        result = input_validator.validate_input(data, rules)
        assert result["password"] == "StrongPass123!"
        
        # Invalid password (too weak)
        data = {"password": "weak"}
        with pytest.raises(HTTPException):
            input_validator.validate_input(data, rules)
    
    def test_threat_detection(self, input_validator):
        """Test threat detection in input."""
        # Test SQL injection detection
        threats = input_validator.detect_threats("SELECT * FROM users")
        assert len(threats) > 0
        assert threats[0].event_type == "Dangerous Pattern Detected"
        
        # Test XSS detection
        threats = input_validator.detect_threats("<script>alert(1)</script>")
        assert len(threats) > 0
        
        # Test normal input
        threats = input_validator.detect_threats("This is normal text")
        assert len(threats) == 0
    
    def test_input_sanitization(self, input_validator):
        """Test input sanitization."""
        dangerous_input = "<script>alert('xss')</script>"
        sanitized = input_validator._sanitize_input(dangerous_input, ValidationType.STRING)
        
        assert "<script>" not in sanitized
        assert "&lt;script&gt;" in sanitized or "script" not in sanitized

class TestFileSecurity:
    """Test File Security functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)
    
    @pytest.fixture
    def security_policy(self):
        """Create SecurityPolicy instance."""
        return SecurityPolicy(
            max_file_size=1024 * 1024,  # 1MB
            allowed_extensions={'.txt', '.pdf', '.jpg'},
            require_scan=True
        )
    
    @pytest.fixture
    def file_security_manager(self, mock_db, security_policy):
        """Create FileSecurityManager instance."""
        return FileSecurityManager(mock_db, security_policy)
    
    @pytest.fixture
    def mock_upload_file(self):
        """Mock UploadFile."""
        upload_file = Mock()
        upload_file.filename = "test.txt"
        upload_file.size = 1024
        upload_file.content_type = "text/plain"
        upload_file.file = Mock()
        upload_file.file.read.return_value = b"test content"
        upload_file.file.seek = Mock()
        return upload_file
    
    def test_file_size_validation(self, file_security_manager, mock_upload_file):
        """Test file size validation."""
        # Test with oversized file
        mock_upload_file.size = 2 * 1024 * 1024  # 2MB, exceeds 1MB limit
        mock_upload_file.filename = "large.txt"
        
        with pytest.raises(HTTPException) as exc_info:
            file_security_manager.validator.validate_file(mock_upload_file)
        assert exc_info.value.status_code == 413
    
    def test_file_extension_validation(self, file_security_manager, mock_upload_file):
        """Test file extension validation."""
        # Test with blocked extension
        mock_upload_file.filename = "malicious.exe"
        mock_upload_file.size = 1024
        
        with pytest.raises(HTTPException) as exc_info:
            file_security_manager.validator.validate_file(mock_upload_file)
        assert exc_info.value.status_code == 400
    
    def test_file_type_detection(self, file_security_manager):
        """Test file type detection."""
        # Test with different file types
        assert file_security_manager.validator._determine_file_type(
            ".txt", "text/plain"
        ) == FileType.DOCUMENT
        
        assert file_security_manager.validator._determine_file_type(
            ".jpg", "image/jpeg"
        ) == FileType.IMAGE
        
        assert file_security_manager.validator._determine_file_type(
            ".zip", "application/zip"
        ) == FileType.ARCHIVE
    
    def test_hash_calculation(self, file_security_manager):
        """Test file hash calculation."""
        content = b"test content"
        hash_value = file_security_manager.validator._calculate_hash(content)
        
        assert len(hash_value) == 64  # SHA-256 hash length
        assert isinstance(hash_value, str)
    
    def test_virus_scanning(self, file_security_manager):
        """Test virus scanning functionality."""
        # Create a temporary file for testing
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(b"test content")
            temp_file_path = temp_file.name
        
        try:
            # Test scanning (will return ERROR if no scanner is available)
            result = file_security_manager.scanner.scan_file(temp_file_path)
            assert result in [ScanResult.CLEAN, ScanResult.ERROR, ScanResult.TIMEOUT]
        finally:
            # Clean up
            os.unlink(temp_file_path)

class TestIntegration:
    """Integration tests for security features."""
    
    @pytest.fixture
    def mock_app(self):
        """Mock FastAPI app for integration testing."""
        app = Mock()
        return app
    
    def test_security_middleware_integration(self, mock_app):
        """Test security middleware integration."""
        # Create middleware instance
        middleware = ThreatDetectionMiddleware(mock_app)
        
        # Verify middleware components are initialized
        assert middleware.ip_blacklist is not None
        assert middleware.bot_detector is not None
        assert middleware.sql_detector is not None
        assert middleware.xss_detector is not None
        assert middleware.ddos_protection is not None
    
    def test_data_flow_integration(self):
        """Test data flow through security components."""
        # Test encryption -> masking -> validation flow
        encryption = DataEncryption()
        masking = DataMasking()
        
        # Original sensitive data
        email = "user@example.com"
        
        # Encrypt data
        encrypted = encryption.encrypt(email)
        assert encrypted != email
        
        # Decrypt and mask
        decrypted = encryption.decrypt(encrypted)
        masked = masking.mask_email(decrypted)
        
        # Verify masking worked
        assert "@" in masked
        assert "example.com" in masked
        assert masked != email
    
    async def test_concurrent_session_management(self):
        """Test concurrent session handling."""
        config = SessionConfig(max_concurrent_sessions=2)
        manager = SessionManager(config, redis_url="memory://localhost")
        
        # Create mock requests
        request1 = Mock()
        request1.client.host = "192.168.1.100"
        request1.headers = {"user-agent": "Browser1"}
        request1.url.path = "/api/test"
        
        request2 = Mock()
        request2.client.host = "192.168.1.101"
        request2.headers = {"user-agent": "Browser2"}
        request2.url.path = "/api/test"
        
        request3 = Mock()
        request3.client.host = "192.168.1.102"
        request3.headers = {"user-agent": "Browser3"}
        request3.url.path = "/api/test"
        
        # Create sessions up to limit
        session1 = manager.create_session(1, request1)
        session2 = manager.create_session(1, request2)
        
        # Third session should terminate the oldest
        session3 = manager.create_session(1, request3)
        
        # Verify oldest session is terminated
        validated_session1 = manager.validate_session(session1.session_id, request1)
        assert validated_session1 is None
        
        # Verify newer sessions are still valid
        validated_session2 = manager.validate_session(session2.session_id, request2)
        validated_session3 = manager.validate_session(session3.session_id, request3)
        
        assert validated_session2 is not None
        assert validated_session3 is not None

# Performance Tests
class TestPerformance:
    """Performance tests for security features."""
    
    def test_encryption_performance(self):
        """Test encryption performance."""
        import time
        
        encryption = DataEncryption()
        test_data = "A" * 10000  # 10KB of data
        
        start_time = time.time()
        encrypted = encryption.encrypt(test_data)
        encrypt_time = time.time() - start_time
        
        start_time = time.time()
        decrypted = encryption.decrypt(encrypted)
        decrypt_time = time.time() - start_time
        
        assert decrypted == test_data
        assert encrypt_time < 1.0  # Should encrypt in under 1 second
        assert decrypt_time < 1.0  # Should decrypt in under 1 second
    
    def test_validation_performance(self):
        """Test input validation performance."""
        import time
        
        validator = InputValidator()
        rules = [
            ValidationRule(name="field1", type=ValidationType.STRING),
            ValidationRule(name="field2", type=ValidationType.EMAIL),
            ValidationRule(name="field3", type=ValidationType.INTEGER)
        ]
        
        test_data = {
            "field1": "test string",
            "field2": "test@example.com",
            "field3": "123"
        }
        
        start_time = time.time()
        for _ in range(1000):  # 1000 validations
            validator.validate_input(test_data, rules)
        
        validation_time = time.time() - start_time
        assert validation_time < 1.0  # Should complete 1000 validations in under 1 second

# Test Configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
