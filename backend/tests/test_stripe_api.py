"""Test Stripe API mocking."""
import pytest
from unittest.mock import patch

def test_stripe_checkout_mock():
    """Test that we can mock the Stripe Checkout API."""
    with patch('stripe.checkout.Session.create') as mock_create:
        # Setup mock
        mock_create.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/c/pay/cs_test_123'
        }
        
        # Import stripe here to avoid any issues
        import stripe
        
        # Call the Stripe API
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': 'price_test_123', 'quantity': 1}],
            mode='subscription',
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel',
            customer_email='test@example.com',
            client_reference_id='1'
        )
        
        # Verify the response
        assert session['id'] == 'cs_test_123'
        assert 'checkout.stripe.com' in session['url']
        
        # Verify the mock was called with the correct parameters
        mock_create.assert_called_once()
        call_args = mock_create.call_args[1]
        assert call_args['payment_method_types'] == ['card']
        assert call_args['line_items'][0]['price'] == 'price_test_123'
        assert 'success' in call_args['success_url']
        assert 'cancel' in call_args['cancel_url']
        assert call_args['customer_email'] == 'test@example.com'
        assert call_args['client_reference_id'] == '1'

def test_stripe_portal_mock():
    """Test that we can mock the Stripe Billing Portal API."""
    with patch('stripe.billing_portal.Session.create') as mock_create:
        # Setup mock
        mock_create.return_value = {
            'url': 'https://billing.stripe.com/session/test_123'
        }
        
        # Import stripe here to avoid any issues
        import stripe
        
        # Call the Stripe API
        session = stripe.billing_portal.Session.create(
            customer='cus_123',
            return_url='https://example.com/account'
        )
        
        # Verify the response
        assert 'billing.stripe.com' in session['url']
        
        # Verify the mock was called with the correct parameters
        mock_create.assert_called_once_with(
            customer='cus_123',
            return_url='https://example.com/account'
        )
