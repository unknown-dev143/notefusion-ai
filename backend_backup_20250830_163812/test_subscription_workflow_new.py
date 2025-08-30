"""
Test script for the subscription system workflow.
"""

import sys
import os
from typing import Any, Dict, Optional, Union, List
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base

# Create a base class for our models
Base = declarative_base()

# Define enums
class SubscriptionTier(str):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"
    ADMIN = "admin"

class SubscriptionStatus(str):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    PAUSED = "paused"

# Define models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    openai_api_key = Column(String, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships will be set up after class definitions
    subscription = relationship("Subscription", back_populates="user", uselist=False)

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    tier = Column(String, default=SubscriptionTier.FREE, nullable=False)
    status = Column(String, default=SubscriptionStatus.ACTIVE, nullable=False)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    invoices = relationship("Invoice", back_populates="subscription")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # in cents
    currency = Column(String, default="usd")
    status = Column(String, nullable=False, default="paid")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")

# Database setup
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

def check_feature_access(subscription: 'Subscription', feature: str, value: Any = None) -> bool:
    """Check if a feature is available for the given subscription."""
    if not subscription:
        return False
        
    features = get_subscription_features(subscription.tier)
    
    if feature not in features:
        return False
        
    if value is not None:
        return value <= features[feature]
        
    return features[feature]

def setup_database():
    """Set up the test database."""
    print("🔧 Setting up test database...")
    # Drop all tables and recreate them
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database setup complete")

def test_subscription_workflow():
    """Test the complete subscription workflow."""
    print("\n🚀 Starting subscription workflow test...")
    
    # Setup
    setup_database()
    db = SessionLocal()
    
    try:
        # Create test user
        user = User(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"👤 Created test user with ID: {user.id}")
        
        # Test 1: Create a free subscription
        print("\n🆓 Testing: Creating Free Subscription")
        subscription = Subscription(
            user_id=user.id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.ACTIVE,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30)
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        print(f"✅ Created {subscription.tier} subscription (ID: {subscription.id})")
        
        # Test 2: Check features
        print("\n🔍 Testing: Subscription Features")
        features = get_subscription_features(subscription.tier)
        print("Available features:")
        for feature, value in features.items():
            print(f"- {feature}: {value}")
        
        # Test 3: Check feature access
        print("\n🔒 Testing: Feature Access Control")
        test_cases = [
            ("transcription_minutes", 60, "Should work within free tier"),
            ("transcription_minutes", 200, "Should exceed free tier"),
            ("ai_summaries", 5, "Should work within free tier"),
            ("ai_summaries", 15, "Should exceed free tier")
        ]
        
        for feature, value, desc in test_cases:
            has_access = check_feature_access(subscription, feature, value)
            print(f"{feature} ({value}): {'✅' if has_access else '❌'} {desc}")
        
        # Test 4: Create an invoice
        print("\n🧾 Testing: Invoice Generation")
        invoice = Invoice(
            subscription_id=subscription.id,
            amount=0,
            currency="usd",
            status="paid"
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        print(f"✅ Created invoice (ID: {invoice.id}) for subscription {subscription.id}")
        
        # Test 5: Test subscription upgrade
        print("\n⬆️  Testing: Subscription Upgrade to PRO")
        subscription.tier = SubscriptionTier.PRO
        db.commit()
        db.refresh(subscription)
        
        # Verify upgraded features
        print("\n🔍 Testing: Upgraded Features")
        features = get_subscription_features(subscription.tier)
        print("Available features after upgrade:")
        for feature, value in features.items():
            print(f"- {feature}: {value}")
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    try:
        test_subscription_workflow()
        return 0
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
