"""Integration tests for payment service."""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.services.payment_service import PaymentService
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionTier
from app.config import settings

class TestPaymentServiceIntegration:
    """Integration tests for PaymentService."""
    
    def test_create_checkout_session(self, db_session, test_user):
        """Test creating a checkout session."""
        # Mock the Stripe API calls
        with patch('stripe.checkout.Session.create') as mock_create:
            # Setup mock response
            mock_create.return_value = {
                'id': 'cs_test_123',
                'url': 'https://checkout.stripe.com/c/pay/cs_test_123',
                'customer': 'cus_123',
                'subscription': 'sub_123',
                'client_reference_id': str(test_user.id),
            }
            
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
            mock_create.assert_called_once()
            call_args = mock_create.call_args[1]
            assert call_args['payment_method_types'] == ['card']
            assert call_args['line_items'][0]['price'] == price_id
            assert success_url in call_args['success_url']
            assert cancel_url == call_args['cancel_url']
            assert call_args['customer_email'] == test_user.email
            assert call_args['client_reference_id'] == str(test_user.id)
    
    def test_create_portal_session(self, db_session, test_user):
        """Test creating a customer portal session."""
        # Mock the Stripe API call
        with patch('stripe.billing_portal.Session.create') as mock_create:
            # Setup mock response
            mock_create.return_value = {
                'url': 'https://billing.stripe.com/session/test_123'
            }
            
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
            mock_create.assert_called_once_with(
                customer=test_user.stripe_customer_id,
                return_url=return_url
            )
    
    def test_handle_webhook_checkout_completed(self, db_session, test_user):
        """Test handling checkout.session.completed webhook event."""
        # Mock the Stripe API calls
        with patch('stripe.Webhook.construct_event') as mock_webhook, \
             patch('stripe.Subscription.retrieve') as mock_retrieve:
            
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
            
            # Setup subscription response
            mock_retrieve.return_value = {
                'id': 'sub_123',
                'status': 'active',
                'current_period_start': int(datetime.now(timezone.utc).timestamp()),
                'current_period_end': int((datetime.now(timezone.utc) + timedelta(days=30)).timestamp()),
                'cancel_at_period_end': False,
                'items': {
                    'data': [{
                        'price': {'id': settings.STRIPE_PRICE_PRO_MONTHLY}
                    }]
                }
            }
            
            # Configure the webhook mock
            mock_webhook.return_value = event_data
            
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
