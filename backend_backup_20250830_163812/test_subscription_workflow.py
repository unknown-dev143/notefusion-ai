"""
Test script for the subscription system.

This script tests the subscription system using the existing project structure.
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models and services
from app.models import Base, User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus
from app.services.subscription import SubscriptionService
from app.models.database import engine, Base, SessionLocal

def setup_database():
    """Set up the test database."""
    print("Setting up test database...")
    # Drop all tables and recreate them
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def create_test_user():
    """Create a test user."""
    db = TestingSessionLocal()
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
        print(f"Created test user with ID: {user.id}")
        return user
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def test_subscription_workflow():
    """Test the complete subscription workflow."""
    # Setup
    setup_database()
    user = create_test_user()
    
    # Initialize services
    subscription_service = SubscriptionService()
    db = TestingSessionLocal()
    
    try:
        # Test 1: Get available plans
        print("\n=== Available Subscription Plans ===")
        plans = subscription_service.get_subscription_plans()
        for plan_id, plan in plans.items():
            print(f"\n{plan['name']} (${plan['price']/100:.2f}/{plan['interval']})")
            print("Features:" + "\n- " + "\n- ".join(plan['features']))
        
        # Test 2: Create a free subscription
        print("\n=== Creating Free Subscription ===")
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
        print(f"Created {subscription.tier} subscription (ID: {subscription.id})")
        
        # Test 3: Check features
        print("\n=== Checking Features ===")
        features = subscription_service.get_subscription_features(subscription)
        print("Available features:")
        for feature, value in features.items():
            print(f"- {feature}: {value}")
        
        # Test 4: Create an invoice
        print("\n=== Creating Invoice ===")
        invoice = Invoice(
            subscription_id=subscription.id,
            amount=0,
            currency="usd",
            status="paid"
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        print(f"Created invoice (ID: {invoice.id}) for subscription {subscription.id}")
        
        print("\n✓ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    test_subscription_workflow()
