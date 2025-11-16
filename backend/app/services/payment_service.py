"""Payment service for handling Stripe integration."""
import os
import stripe
from typing import Dict, Optional, List
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, SubscriptionTier

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY
WEBHOOK_SECRET = settings.STRIPE_WEBHOOK_SECRET

class PaymentService:
    """Service for handling payment-related operations."""
    
    @staticmethod
    def create_checkout_session(
        user: User,
        price_id: str,
        success_url: str,
        cancel_url: str,
    ) -> Dict:
        """Create a Stripe Checkout session for subscription.
        
        Args:
            user: The user creating the checkout session
            price_id: Stripe price ID for the subscription
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is canceled
            
        Returns:
            Dict containing the session ID and URL
        """
        try:
            # Create a new checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                customer_email=user.email,
                client_reference_id=str(user.id),
                metadata={
                    'user_id': str(user.id),
                    'email': user.email,
                }
            )
            
            return {
                'session_id': session.id,
                'url': session.url
            }
            
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    @staticmethod
    def create_portal_session(user: User, return_url: str) -> Dict:
        """Create a Stripe Customer Portal session.
        
        Args:
            user: The user accessing the portal
            return_url: URL to return to after portal interaction
            
        Returns:
            Dict containing the portal URL
        """
        if not user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No subscription found"
            )
            
        try:
            session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id,
                return_url=return_url,
            )
            
            return {
                'url': session.url
            }
            
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    @classmethod
    def handle_webhook_event(
        cls,
        payload: bytes,
        signature: str,
        db: Session
    ) -> Dict:
        """Handle Stripe webhook events.
        
        Args:
            payload: Raw webhook payload
            signature: Stripe signature header
            db: Database session
            
        Returns:
            Dict with status of the operation
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, WEBHOOK_SECRET
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload"
            )
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )
        
        # Handle the event
        event_type = event['type']
        event_data = event['data']['object']
        
        if event_type == 'checkout.session.completed':
            return cls._handle_checkout_session_completed(event_data, db)
        elif event_type == 'customer.subscription.updated':
            return cls._handle_subscription_updated(event_data, db)
        elif event_type == 'customer.subscription.deleted':
            return cls._handle_subscription_deleted(event_data, db)
        elif event_type == 'invoice.payment_succeeded':
            return cls._handle_invoice_paid(event_data, db)
        elif event_type == 'invoice.payment_failed':
            return cls._handle_payment_failed(event_data, db)
        
        return {'status': 'success', 'event': event_type}
    
    @staticmethod
    def _handle_checkout_session_completed(session: Dict, db: Session) -> Dict:
        """Handle successful checkout session completion."""
        user_id = session.get('client_reference_id')
        subscription_id = session.get('subscription')
        customer_id = session.get('customer')
        
        if not all([user_id, subscription_id, customer_id]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session data"
            )
        
        # Get the subscription details from Stripe
        stripe_sub = stripe.Subscription.retrieve(subscription_id)
        price_id = stripe_sub['items']['data'][0]['price']['id']
        
        # Map price ID to subscription tier
        price_mapping = {
            settings.STRIPE_PRICE_BASIC: SubscriptionTier.FREE,
            settings.STRIPE_PRICE_PRO: SubscriptionTier.PRO,
            settings.STRIPE_PRICE_BUSINESS: SubscriptionTier.BUSINESS,
        }
        
        tier = price_mapping.get(price_id, SubscriptionTier.FREE)
        
        # Update or create user's subscription
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user's Stripe customer ID
        user.stripe_customer_id = customer_id
        
        # Create or update subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        
        if not subscription:
            subscription = Subscription(
                user_id=user.id,
                stripe_subscription_id=subscription_id,
                tier=tier,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=datetime.fromtimestamp(stripe_sub['current_period_start']),
                current_period_end=datetime.fromtimestamp(stripe_sub['current_period_end']),
                cancel_at_period_end=stripe_sub['cancel_at_period_end']
            )
            db.add(subscription)
        else:
            subscription.stripe_subscription_id = subscription_id
            subscription.tier = tier
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.current_period_start = datetime.fromtimestamp(stripe_sub['current_period_start'])
            subscription.current_period_end = datetime.fromtimestamp(stripe_sub['current_period_end'])
            subscription.cancel_at_period_end = stripe_sub['cancel_at_period_end']
        
        db.commit()
        return {'status': 'success'}
    
    @staticmethod
    def _handle_subscription_updated(subscription: Dict, db: Session) -> Dict:
        """Handle subscription update events."""
        subscription_id = subscription['id']
        
        # Find the subscription in our database
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if not db_subscription:
            return {'status': 'success', 'message': 'Subscription not found'}
        
        # Update subscription details
        db_subscription.status = subscription['status']
        db_subscription.current_period_start = datetime.fromtimestamp(subscription['current_period_start'])
        db_subscription.current_period_end = datetime.fromtimestamp(subscription['current_period_end'])
        db_subscription.cancel_at_period_end = subscription['cancel_at_period_end']
        
        db.commit()
        return {'status': 'success'}
    
    @staticmethod
    def _handle_subscription_deleted(subscription: Dict, db: Session) -> Dict:
        """Handle subscription cancellation events."""
        subscription_id = subscription['id']
        
        # Find the subscription in our database
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if not db_subscription:
            return {'status': 'success', 'message': 'Subscription not found'}
        
        # Update subscription status
        db_subscription.status = SubscriptionStatus.CANCELED
        db_subscription.cancel_at_period_end = True
        
        db.commit()
        return {'status': 'success'}
    
    @staticmethod
    def _handle_invoice_paid(invoice: Dict, db: Session) -> Dict:
        """Handle successful invoice payment events."""
        # You can add invoice processing logic here
        # For example, send a receipt email or update billing records
        return {'status': 'success'}
    
    @staticmethod
    def _handle_payment_failed(invoice: Dict, db: Session) -> Dict:
        """Handle failed payment events."""
        customer_id = invoice.get('customer')
        if not customer_id:
            return {'status': 'error', 'message': 'No customer ID in invoice'}
        
        # Find the user by Stripe customer ID
        user = db.query(User).filter(
            User.stripe_customer_id == customer_id
        ).first()
        
        if not user:
            return {'status': 'error', 'message': 'User not found'}
        
        # Find the subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        
        if not subscription:
            return {'status': 'error', 'message': 'Subscription not found'}
        
        # Update subscription status
        subscription.status = SubscriptionStatus.PAST_DUE
        db.commit()
        
        # TODO: Send payment failure notification to user
        
        return {'status': 'success'}
