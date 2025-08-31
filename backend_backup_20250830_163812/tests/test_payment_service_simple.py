"""Simple tests for payment service without database operations."""
from unittest.mock import patch, MagicMock

class TestPaymentServiceSimple:
    """Simple test cases for PaymentService."""
    
    @patch('stripe.checkout.Session.create')
    def test_create_checkout_session(self, mock_create):
        """Test creating a checkout session."""
        # Setup mock
        mock_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/c/pay/cs_test_123'
        }
        
        # Import inside test to avoid SQLAlchemy
        from app.services.payment_service import PaymentService
        
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
        
        # Import inside test to avoid SQLAlchemy
        from app.services.payment_service import PaymentService
        
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
