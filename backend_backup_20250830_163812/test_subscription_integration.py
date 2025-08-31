"""
Integration test for the subscription system.

This script tests the complete subscription workflow including:
- User creation
- Subscription management
- Feature access control
- Invoice generation
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models and services
from app.models import User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus
from app.services.subscription import SubscriptionService
from app.models.database import engine, Base, SessionLocal

def setup_database():
    """Set up the test database."""
    print("🔧 Setting up test database...")
    # Drop all tables and recreate them
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database setup complete")

def create_test_user():
    """Create a test user."""
    db = SessionLocal()
    try:
        user = User(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"👤 Created test user with ID: {user.id}")
        return user
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def test_subscription_workflow():
    """Test the complete subscription workflow."""
    print("\n🚀 Starting subscription system tests...")
    
    # Setup
    setup_database()
    user = create_test_user()
    
    # Initialize services
    subscription_service = SubscriptionService()
    db = SessionLocal()
    
    try:
        # Test 1: Get available plans
        print("\n📋 Testing: Available Subscription Plans")
        plans = subscription_service.get_subscription_plans()
        print(f"Found {len(plans)} subscription plans:")
        for plan_id, plan in plans.items():
            print(f"\n{plan['name']} (${plan['price']/100:.2f}/{plan['interval']})")
            print("Features:" + "\n- " + "\n- ".join(plan['features']))
        
        # Test 2: Create a free subscription
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
        
        # Test 3: Check features
        print("\n🔍 Testing: Subscription Features")
        features = subscription_service.get_subscription_features(subscription)
        print("Available features:")
        for feature, value in features.items():
            print(f"- {feature}: {value}")
        
        # Test 4: Test feature access
        print("\n🔒 Testing: Feature Access Control")
        test_cases = [
            ("transcription_minutes", 60, "Should work within free tier"),
            ("transcription_minutes", 200, "Should exceed free tier"),
            ("ai_summaries", 5, "Should work within free tier"),
            ("ai_summaries", 15, "Should exceed free tier")
        ]
        
        for feature, value, desc in test_cases:
            has_access = subscription_service.check_feature_access(
                subscription, feature, value
            )
            print(f"{feature} ({value}): {'✅' if has_access else '❌'} {desc}")
        
        # Test 5: Create an invoice
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
        
        # Test 6: Test subscription upgrade
        print("\n⬆️  Testing: Subscription Upgrade")
        subscription.tier = SubscriptionTier.PRO
        subscription.status = SubscriptionStatus.ACTIVE
        db.commit()
        db.refresh(subscription)
        print(f"✅ Upgraded to {subscription.tier} subscription")
        
        # Test 7: Check upgraded features
        print("\n🔍 Testing: Upgraded Features")
        features = subscription_service.get_subscription_features(subscription)
        for feature, value in features.items():
            print(f"- {feature}: {value}")
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    test_subscription_workflow()
