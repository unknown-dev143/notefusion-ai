"""Tests for payment service with mocked SQLAlchemy models."""
import sys
from unittest.mock import MagicMock, patch

# Mock SQLAlchemy and related modules
sys.modules['sqlalchemy'] = MagicMock()
sys.modules['sqlalchemy.orm'] = MagicMock()
sys.modules['app.models'] = MagicMock()
sys.modules['app.models.user'] = MagicMock()
sys.modules['app.models.subscription'] = MagicMock()

# Mock the Subscription model
class MockSubscription:
    id = 1
    user_id = 1
    stripe_subscription_id = 'sub_123'
    status = 'active'
    tier = 'pro'
    current_period_start = None
    current_period_end = None
    cancel_at_period_end = False

# Apply the mock
sys.modules['app.models.subscription'].Subscription = MockSubscription

# Now import the service
from app.services.payment_service import PaymentService

class TestPaymentServiceWithMocks:
    """Test cases for PaymentService with mocked models."""
    
    @patch('stripe.checkout.Session.create')
    def test_create_checkout_session(self, mock_create):
        """Test creating a checkout session."""
        # Setup mock
        mock_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/c/pay/cs_test_123'
        }
        
        # Create a simple user mock
        class MockUser:
            id = 1
            email = 'test@example.com'
        
        # Call the method
        result = PaymentService.create_checkout_session(
            user=MockUser(),
            price_id='price_test_123',
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel'
        )
        
        # Verify
        assert result['session_id'] == 'cs_test_123'
        assert 'checkout.stripe.com' in result['url']
        mock_create.assert_called_once()
    
    @patch('stripe.billing_portal.Session.create')
    def test_create_portal_session(self, mock_create):
        """Test creating a customer portal session."""
        # Setup mock
        mock_create.return_value = {
            'url': 'https://billing.stripe.com/session/test_123'
        }
        
        # Create a simple user mock
        class MockUser:
            stripe_customer_id = 'cus_123'
        
        # Call the method
        result = PaymentService.create_portal_session(
            user=MockUser(),
            return_url='https://example.com/account'
        )
        
        # Verify
        assert 'billing.stripe.com' in result['url']
        mock_create.assert_called_once_with(
            customer='cus_123',
            return_url='https://example.com/account'
        )
