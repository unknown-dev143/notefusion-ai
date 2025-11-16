"""Simple tests for payment service."""
import pytest
from unittest.mock import patch, MagicMock

def test_payment_service_import():
    """Test that the payment service can be imported."""
    from app.services.payment_service import PaymentService
    assert PaymentService is not None

@patch('stripe.checkout.Session.create')
def test_create_checkout_session(mock_create):
    """Test creating a checkout session."""
    from app.services.payment_service import PaymentService
    from app.models import User
    
    # Setup test data
    user = User(
        id=1,
        email='test@example.com',
        hashed_password='hashed_password',
        is_active=True
    )
    
    # Setup mock
    mock_create.return_value = {
        'id': 'cs_test_123',
        'url': 'https://checkout.stripe.com/c/pay/cs_test_123'
    }
    
    # Call the method
    result = PaymentService.create_checkout_session(
        user=user,
        price_id='price_test_123',
        success_url='https://example.com/success',
        cancel_url='https://example.com/cancel'
    )
    
    # Assertions
    assert 'session_id' in result
    assert 'url' in result
    assert result['session_id'] == 'cs_test_123'
    assert 'checkout.stripe.com' in result['url']
    
    # Verify the mock was called
    mock_create.assert_called_once()
