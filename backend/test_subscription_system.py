import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models and services
from app.models import Base, User, Subscription, Invoice, SubscriptionTier, SubscriptionStatus
from app.services.subscription import SubscriptionService
from app.models.database import SessionLocal, init_db

# Database setup
DATABASE_URL = "sqlite:///./test_subscription.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_data():
    """Create test data for the subscription system."""
    db = TestingSessionLocal()
    try:
        # Create a test user
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
        
        # Create a free subscription
        free_sub = Subscription(
            user_id=user.id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.ACTIVE,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30)
        )
        db.add(free_sub)
        db.commit()
        db.refresh(free_sub)
        print(f"Created free subscription with ID: {free_sub.id}")
        
        # Create an invoice
        invoice = Invoice(
            subscription_id=free_sub.id,
            amount=0,
            currency="usd",
            status="paid"
        )
        db.add(invoice)
        db.commit()
        print(f"Created invoice with ID: {invoice.id}")
        
        return user.id
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def test_subscription_features(user_id):
    """Test subscription features."""
    db = TestingSessionLocal()
    try:
        service = SubscriptionService()
        subscription = service.get_user_subscription(db, user_id)
        
        if not subscription:
            print("No subscription found")
            return
            
        print(f"\nTesting subscription features for user {user_id}")
        print(f"Tier: {subscription.tier}, Status: {subscription.status}")
        
        features = service.get_subscription_features(subscription)
        print("\nFeatures:")
        for k, v in features.items():
            print(f"- {k}: {v}")
            
    except Exception as e:
        print(f"Error testing features: {e}")
        raise
    finally:
        db.close()

def test_plans():
    """Test subscription plans."""
    try:
        service = SubscriptionService()
        print("\nAvailable plans:")
        for plan in service.get_subscription_plans():
            print(f"\n{plan['name']} (${plan['price']/100:.2f}/{plan['interval']})")
            print("Features:" + "\n- " + "\n- ".join(plan['features']))
    except Exception as e:
        print(f"Error testing plans: {e}")
        raise

def main():
    """Run all tests."""
    print("Setting up test database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("\nCreating test data...")
    user_id = create_test_data()
    
    print("\nTesting features...")
    test_subscription_features(user_id)
    
    print("\nTesting plans...")
    test_plans()
    
    print("\nTests completed!")

if __name__ == "__main__":
    main()
