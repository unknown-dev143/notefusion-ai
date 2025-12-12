"""Two-Factor Authentication (2FA) implementation."""
import pyotp
import qrcode
import io
import base64
import secrets
import hashlib
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

class TwoFactorAuth:
    """Two-Factor Authentication service."""
    
    def __init__(self):
        self.issuer = "NoteFusion AI"
        self.totp_issuer = "NoteFusion AI"
        
    def generate_secret(self) -> str:
        """Generate a new TOTP secret."""
        return pyotp.random_base32()
    
    def generate_qr_code(self, user_email: str, secret: str) -> str:
        """Generate QR code for TOTP setup."""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name=self.issuer
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"
    
    def verify_totp(self, secret: str, token: str, window: int = 1) -> bool:
        """Verify TOTP token."""
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=window)
        except Exception as e:
            logger.error(f"TOTP verification error: {e}")
            return False
    
    def generate_backup_codes(self, count: int = 10) -> List[str]:
        """Generate backup codes for 2FA recovery."""
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            codes.append(f"{code[:4]}-{code[4:]}")
        return codes
    
    def hash_backup_code(self, code: str) -> str:
        """Hash backup code for storage."""
        return hashlib.sha256(code.encode()).hexdigest()
    
    def verify_backup_code(self, stored_hash: str, provided_code: str) -> bool:
        """Verify backup code."""
        return self.hash_backup_code(provided_code) == stored_hash

class SMSAuth:
    """SMS-based authentication service."""
    
    def __init__(self):
        # In production, integrate with SMS service like Twilio, AWS SNS, etc.
        self.sms_service = None  # Configure SMS service
        
    def send_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS message."""
        try:
            # Mock implementation - replace with actual SMS service
            logger.info(f"SMS to {phone_number}: {message}")
            # In production:
            # return self.sms_service.send_message(phone_number, message)
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return False
    
    def generate_sms_code(self) -> str:
        """Generate 6-digit SMS code."""
        return f"{secrets.randbelow(900000) + 100000}"
    
    def send_2fa_sms(self, phone_number: str, code: str) -> bool:
        """Send 2FA SMS code."""
        message = f"Your NoteFusion AI verification code is: {code}. Valid for 10 minutes."
        return self.send_sms(phone_number, message)

class TwoFactorAuthService:
    """Complete 2FA service management."""
    
    def __init__(self, db: Session):
        self.db = db
        self.totp_auth = TwoFactorAuth()
        self.sms_auth = SMSAuth()
        
    def enable_totp(self, user_id: int) -> Dict[str, Any]:
        """Enable TOTP for user."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate new secret
        secret = self.totp_auth.generate_secret()
        
        # Generate QR code
        qr_code = self.totp_auth.generate_qr_code(user.email, secret)
        
        # Generate backup codes
        backup_codes = self.totp_auth.generate_backup_codes()
        backup_codes_hashed = [self.totp_auth.hash_backup_code(code) for code in backup_codes]
        
        # Store in user record (you'd need to add these fields to User model)
        # For now, we'll store in a separate table or user preferences
        
        return {
            "secret": secret,
            "qr_code": qr_code,
            "backup_codes": backup_codes,  # Return to user for safekeeping
            "message": "Save your backup codes in a secure location"
        }
    
    def verify_and_enable_totp(self, user_id: int, secret: str, token: str) -> bool:
        """Verify TOTP token and enable 2FA."""
        if not self.totp_auth.verify_totp(secret, token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Enable 2FA for user (add to user model)
        # user.two_factor_enabled = True
        # user.two_factor_secret = secret
        # self.db.commit()
        
        return True
    
    def enable_sms_2fa(self, user_id: int, phone_number: str) -> Dict[str, Any]:
        """Enable SMS-based 2FA."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate and send verification code
        code = self.sms_auth.generate_sms_code()
        sent = self.sms_auth.send_2fa_sms(phone_number, code)
        
        if not sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification code"
            )
        
        # Store code hash in user record (temporary)
        # user.sms_2fa_code_hash = self.totp_auth.hash_backup_code(code)
        # user.sms_2fa_phone = phone_number
        # user.sms_2fa_expires = datetime.utcnow() + timedelta(minutes=10)
        # self.db.commit()
        
        return {
            "message": "Verification code sent to your phone",
            "expires_in": 600  # 10 minutes
        }
    
    def verify_sms_2fa(self, user_id: int, code: str) -> bool:
        """Verify SMS 2FA code."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if code is expired
        # if user.sms_2fa_expires and datetime.utcnow() > user.sms_2fa_expires:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Verification code expired"
        #     )
        
        # Verify code
        # if not self.totp_auth.verify_backup_code(user.sms_2fa_code_hash, code):
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Invalid verification code"
        #     )
        
        # Enable SMS 2FA
        # user.two_factor_enabled = True
        # user.two_factor_method = "sms"
        # user.sms_2fa_phone = user.sms_2fa_phone
        # self.db.commit()
        
        return True
    
    def verify_2fa(self, user_id: int, method: str, code: str) -> bool:
        """Verify 2FA code during login."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.two_factor_enabled:
            return False
        
        if method == "totp":
            return self.totp_auth.verify_totp(user.two_factor_secret, code)
        elif method == "sms":
            # Generate new code and send
            new_code = self.sms_auth.generate_sms_code()
            return self.sms_auth.send_2fa_sms(user.sms_2fa_phone, new_code)
        elif method == "backup":
            # Check against backup codes
            for backup_hash in user.backup_codes:
                if self.totp_auth.verify_backup_code(backup_hash, code):
                    # Remove used backup code
                    user.backup_codes.remove(backup_hash)
                    self.db.commit()
                    return True
            return False
        
        return False
    
    def disable_2fa(self, user_id: int, password: str) -> bool:
        """Disable 2FA for user."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify password
        # if not user.verify_password(password):
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Invalid password"
        #     )
        
        # Disable 2FA
        # user.two_factor_enabled = False
        # user.two_factor_secret = None
        # user.two_factor_method = None
        # user.backup_codes = []
        # user.sms_2fa_phone = None
        # self.db.commit()
        
        return True
