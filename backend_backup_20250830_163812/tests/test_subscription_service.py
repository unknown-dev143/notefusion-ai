"""Test cases for subscription service."""
from typing import Any, Dict, List, Optional
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from tests.models import Subscription, SubscriptionTier, SubscriptionStatus, User, Invoice
from tests.conftest import db_session, test_user, free_subscription, pro_subscription, business_subscription, admin_subscription

def get_subscription_features(tier: str) -> dict:
    """Get features for a subscription tier."""
    features = {
        "transcription_minutes": 120,
        "ai_summaries": 10,
        "export_formats": ["txt", "pdf"],
        "max_file_size_mb": 25,
        "api_access": False,
        "priority_support": False,
        "team_members": 1
    }
    
    if tier == SubscriptionTier.PRO:
        features.update({
            "transcription_minutes": 1800,
            "ai_summaries": 100,
            "export_formats": ["txt", "pdf", "docx", "srt"],
            "max_file_size_mb": 100,
            "api_access": True,
            "priority_support": True
        })
    elif tier == SubscriptionTier.BUSINESS:
        features.update({
            "transcription_minutes": float('inf'),
            "ai_summaries": float('inf'),
            "export_formats": ["txt", "pdf", "docx", "srt", "vtt", "json"],
            "max_file_size_mb": 500,
            "api_access": True,
            "priority_support": True,
            "team_members": 10,
            "custom_vocabulary": True,
            "speaker_diarization": True
        })
    elif tier == SubscriptionTier.ADMIN:
        features.update({
            "transcription_minutes": float('inf'),
            "ai_summaries": float('inf'),
            "export_formats": ["txt", "pdf", "docx", "srt", "vtt", "json"],
            "max_file_size_mb": 1000,
            "api_access": True,
            "priority_support": True,
            "team_members": float('inf'),
            "custom_vocabulary": True,
            "speaker_diarization": True,
            "admin_access": True
        })
    
    return features

def check_feature_access(subscription, feature: str, value: Any = None) -> bool:
    """Check if a feature is available for the given subscription."""
    if not subscription:
        return False
        
    features = get_subscription_features(subscription.tier)
    
    if feature not in features:
        return False
        
    if value is not None:
        feature_value = features[feature]
        if isinstance(feature_value, (int, float)) and not isinstance(feature_value, bool):
            return value <= feature_value
        return value == feature_value
        
    return features[feature]

class TestSubscriptionFeatures:
    """Test subscription features and access control."""
    
    def test_free_tier_features(self, free_subscription):
        """Test free tier features."""
        features = get_subscription_features(free_subscription.tier)
        assert features["transcription_minutes"] == 120
        assert features["ai_summaries"] == 10
        assert features["api_access"] is False
        
    def test_pro_tier_features(self, pro_subscription):
        """Test pro tier features."""
        features = get_subscription_features(pro_subscription.tier)
        assert features["transcription_minutes"] == 1800
        assert features["ai_summaries"] == 100
        assert features["api_access"] is True
        
    def test_business_tier_features(self, business_subscription):
        """Test business tier features."""
        features = get_subscription_features(business_subscription.tier)
        assert features["transcription_minutes"] == float('inf')
        assert features["ai_summaries"] == float('inf')
        assert features["team_members"] == 10
        assert features["speaker_diarization"] is True
        
    def test_admin_tier_features(self, admin_subscription):
        """Test admin tier features."""
        features = get_subscription_features(admin_subscription.tier)
        assert features["transcription_minutes"] == float('inf')
        assert features["team_members"] == float('inf')
        assert features["admin_access"] is True

class TestFeatureAccess:
    """Test feature access control."""
    
    def test_free_tier_access(self, free_subscription):
        """Test free tier access control."""
        # Within limits
        assert check_feature_access(free_subscription, "transcription_minutes", 60) is True
        assert check_feature_access(free_subscription, "ai_summaries", 5) is True
        
        # Exceeds limits
        assert check_feature_access(free_subscription, "transcription_minutes", 200) is False
        assert check_feature_access(free_subscription, "ai_summaries", 15) is False
        
        # Unavailable features
        assert check_feature_access(free_subscription, "api_access") is False
        assert check_feature_access(free_subscription, "custom_vocabulary") is False
        
    def test_pro_tier_access(self, pro_subscription):
        """Test pro tier access control."""
        # Within limits
        assert check_feature_access(pro_subscription, "transcription_minutes", 1000) is True
        assert check_feature_access(pro_subscription, "ai_summaries", 50) is True
        
        # Exceeds limits
        assert check_feature_access(pro_subscription, "transcription_minutes", 2000) is False
        assert check_feature_access(pro_subscription, "ai_summaries", 150) is False
        
        # Available features
        assert check_feature_access(pro_subscription, "api_access") is True
        assert check_feature_access(pro_subscription, "priority_support") is True
        
    def test_business_tier_access(self, business_subscription):
        """Test business tier access control."""
        # Unlimited features
        assert check_feature_access(business_subscription, "transcription_minutes", 10000) is True
        assert check_feature_access(business_subscription, "ai_summaries", 1000) is True
        
        # Team members limit
        assert check_feature_access(business_subscription, "team_members", 5) is True
        assert check_feature_access(business_subscription, "team_members", 15) is False
        
        # Advanced features
        assert check_feature_access(business_subscription, "custom_vocabulary") is True
        assert check_feature_access(business_subscription, "speaker_diarization") is True
        
    def test_admin_tier_access(self, admin_subscription):
        """Test admin tier access control."""
        # Unlimited everything
        assert check_feature_access(admin_subscription, "transcription_minutes", float('inf')) is True
        assert check_feature_access(admin_subscription, "ai_summaries", float('inf')) is True
        assert check_feature_access(admin_subscription, "team_members", 1000) is True
        
        # Admin features
        assert check_feature_access(admin_subscription, "admin_access") is True
        assert check_feature_access(admin_subscription, "custom_vocabulary") is True

class TestSubscriptionLifecycle:
    """Test subscription lifecycle operations."""
    
    def test_subscription_creation(self, db_session, test_user):
        """Test creating a new subscription."""
        # Create a new subscription
        now = datetime.now(timezone.utc)
        subscription = Subscription(
            user_id=test_user.id,
            tier=SubscriptionTier.PRO,
            status=SubscriptionStatus.ACTIVE,
            current_period_start=now,
            current_period_end=now + timedelta(days=30)
        )
        db_session.add(subscription)
        db_session.commit()
        
        # Verify subscription was created
        assert subscription.id is not None
        assert subscription.tier == SubscriptionTier.PRO
        assert subscription.status == SubscriptionStatus.ACTIVE
        
    def test_subscription_upgrade(self, db_session, free_subscription):
        """Test upgrading a subscription."""
        # Upgrade to PRO
        free_subscription.tier = SubscriptionTier.PRO
        db_session.commit()
        db_session.refresh(free_subscription)
        
        # Verify upgrade
        assert free_subscription.tier == SubscriptionTier.PRO
        features = get_subscription_features(free_subscription.tier)
        assert features["transcription_minutes"] == 1800
        
    def test_subscription_cancellation(self, db_session, pro_subscription):
        """Test canceling a subscription."""
        # Cancel subscription
        pro_subscription.status = SubscriptionStatus.CANCELED
        pro_subscription.cancel_at_period_end = True
        db_session.commit()
        db_session.refresh(pro_subscription)
        
        # Verify cancellation
        assert pro_subscription.status == SubscriptionStatus.CANCELED
        assert pro_subscription.cancel_at_period_end is True

class TestInvoiceGeneration:
    """Test invoice generation and management."""
    
    def test_invoice_creation(self, db_session, pro_subscription):
        """Test creating an invoice for a subscription."""
        # Create invoice
        invoice = Invoice(
            subscription_id=pro_subscription.id,
            amount=1500,  # $15.00
            currency="usd",
            status="paid"
        )
        db_session.add(invoice)
        db_session.commit()
        
        # Verify invoice was created
        assert invoice.id is not None
        assert invoice.amount == 1500
        assert invoice.currency == "usd"
        assert invoice.status == "paid"
        assert invoice.subscription_id == pro_subscription.id
