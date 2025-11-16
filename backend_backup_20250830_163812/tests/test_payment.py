"""Tests for payment service."""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status

from app.services.payment_service import PaymentService
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionTier
from app.config import settings

@pytest.fixture
def mock_stripe():
    """Mock Stripe API responses."""
    with patch('stripe.checkout.Session.create') as mock_checkout, \
         patch('stripe.billing_portal.Session.create') as mock_portal, \
         patch('stripe.Webhook.construct_event') as mock_webhook, \
         patch('stripe.Subscription.retrieve') as mock_retrieve:
        
        # Mock responses
        mock_checkout.return_value = {
            'id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/c/pay/cs_test_123',
            'customer': 'cus_123',
            'subscription': 'sub_123',
            'client_reference_id': '1',
        }
        
        mock_portal.return_value = {
            'url': 'https://billing.stripe.com/session/test_123'
        }
        
        # Create a MagicMock for the subscription object
        subscription_mock = MagicMock()
        subscription_mock.id = 'sub_123'
        subscription_mock.status = 'active'
        subscription_mock.current_period_start = int(datetime.now(timezone.utc).timestamp())
        subscription_mock.current_period_end = int((datetime.now(timezone.utc) + timedelta(days=30)).timestamp())
        subscription_mock.cancel_at_period_end = False
        
        # Create a MagicMock for the price object
        price_mock = MagicMock()
        price_mock.id = settings.STRIPE_PRICE_PRO_MONTHLY
        
        # Create a MagicMock for the items object
        items_mock = MagicMock()
        items_mock.data = [MagicMock(price=price_mock)]
        
        # Set the items attribute on the subscription mock
        subscription_mock.items = items_mock
        
        # Return the subscription mock
        mock_retrieve.return_value = subscription_mock
        
        yield {
            'checkout': mock_checkout,
            'portal': mock_portal,
            'webhook': mock_webhook,
            'retrieve': mock_retrieve
        }

class TestPaymentService:
    """Test cases for PaymentService."""
    
    def test_create_checkout_session(self, mock_stripe, db_session, test_user):
        """Test creating a checkout session."""
        # Test data
        price_id = 'price_test_123'
        success_url = 'https://example.com/success'
        cancel_url = 'https://example.com/cancel'
        
        # Call the method
        result = PaymentService.create_checkout_session(
            user=test_user,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        # Assertions
        assert 'session_id' in result
        assert 'url' in result
        assert result['session_id'] == 'cs_test_123'
        assert 'checkout.stripe.com' in result['url']
        
        # Verify the mock was called with the correct parameters
        mock_stripe['checkout'].assert_called_once()
        call_args = mock_stripe['checkout'].call_args[1]
        assert call_args['payment_method_types'] == ['card']
        assert call_args['line_items'][0]['price'] == price_id
        assert success_url in call_args['success_url']
        assert cancel_url == call_args['cancel_url']
        assert call_args['customer_email'] == test_user.email
        assert call_args['client_reference_id'] == str(test_user.id)
    
    def test_create_portal_session(self, mock_stripe, db_session, test_user):
        """Test creating a customer portal session."""
        # Test data
        test_user.stripe_customer_id = 'cus_123'
        db_session.add(test_user)
        db_session.commit()
        
        return_url = 'https://example.com/account'
        
        # Call the method
        result = PaymentService.create_portal_session(
            user=test_user,
            return_url=return_url
        )
        
        # Assertions
        assert 'url' in result
        assert 'billing.stripe.com' in result['url']
        
        # Verify the mock was called with the correct parameters
        mock_stripe['portal'].assert_called_once_with(
            customer=test_user.stripe_customer_id,
            return_url=return_url
        )
    
    def test_handle_webhook_checkout_completed(self, mock_stripe, db_session, test_user):
        """Test handling checkout.session.completed webhook event."""
        # Setup webhook event
        event_data = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': 'cs_test_123',
                    'client_reference_id': str(test_user.id),
                    'subscription': 'sub_123',
                    'customer': 'cus_123',
                    'customer_email': test_user.email,
                    'customer_details': {
                        'email': test_user.email
                    }
                }
            }
        }
        
        # Configure the webhook mock
        mock_stripe['webhook'].return_value = event_data
        
        # Call the method
        result = PaymentService.handle_webhook_event(
            payload=b'test_payload',
            signature='test_signature',
            db=db_session
        )
        
        # Assertions
        assert result['status'] == 'success'
        
        # Verify subscription was created
        subscription = db_session.query(Subscription).filter(
            Subscription.user_id == test_user.id
        ).first()
        
        assert subscription is not None
        assert subscription.stripe_subscription_id == 'sub_123'
        assert subscription.tier == SubscriptionTier.PRO
        assert subscription.status == SubscriptionStatus.ACTIVE
        
        # Verify the webhook was called with the correct parameters
        mock_stripe['webhook'].assert_called_once_with(
            b'test_payload',
            'test_signature',
            settings.STRIPE_WEBHOOK_SECRET
        )
        
        # Verify the subscription was retrieved
        mock_stripe['retrieve'].assert_called_once_with('sub_123')
