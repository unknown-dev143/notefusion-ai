"""Minimal test to isolate the metadata issue."""
import pytest
from unittest.mock import patch, MagicMock

def test_minimal():
    """Minimal test to verify the test environment."""
    assert True

class TestMocking:
    """Test mocking behavior."""
    
    def test_mock_dict(self):
        """Test dictionary mocking."""
        mock_dict = MagicMock()
        mock_dict.__getitem__.side_effect = {'key': 'value'}.__getitem__
        assert mock_dict['key'] == 'value'
    
    @patch('stripe.checkout.Session.create')
    def test_stripe_mock(self, mock_create):
        """Test Stripe mock setup."""
        # Setup mock
        mock_create.return_value = {
            'id': 'test_id',
            'url': 'https://example.com'
        }
        
        # Call the mock
        from stripe.checkout import Session
        session = Session.create(
            payment_method_types=['card'],
            line_items=[{'price': 'price_test_123', 'quantity': 1}],
            mode='subscription',
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel',
            customer_email='test@example.com'
        )
        
        # Verify the mock was called
        mock_create.assert_called_once_with(
            payment_method_types=['card'],
            line_items=[{'price': 'price_test_123', 'quantity': 1}],
            mode='subscription',
            success_url='https://example.com/success',
            cancel_url='https://example.com/cancel',
            customer_email='test@example.com'
        )
        
        # Verify the response
        assert session['id'] == 'test_id'
        assert session['url'] == 'https://example.com'
