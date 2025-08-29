from typing import Any, Dict, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
import os
from pathlib import Path
from datetime import datetime

from app.core.config import settings

# Set up Jinja2 environment
templates_dir = Path(__file__).parent.parent / "templates" / "emails"
env = Environment(loader=FileSystemLoader(templates_dir))

def send_email(
    email_to: str,
    subject: str,
    template_name: str,
    template_vars: Dict[str, Any],
) -> None:
    """
    Send an email using SMTP
    """
    if not settings.EMAILS_ENABLED:
        print("Email sending is disabled. Enable it in settings.")
        return

    # Add current year to template vars
    template_vars.update({
        "current_year": datetime.now().year,
        "app_name": settings.PROJECT_NAME,
    })
    
    # Render email template
    template = env.get_template(f"{template_name}.html")
    html_content = template.render(**template_vars)
    
    # Create message
    msg = MIMEMultipart("alternative")
    msg["From"] = settings.ONTACT_EMAIL
    msg["To"] = email_to
    msg["Subject"] = subject
    
    # Attach HTML content
    msg.attach(MIMEText(html_content, "html"))
    
    try:
        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Error sending email: {e}")

def send_new_account_email(email_to: str, username: str, token: str) -> None:
    """
    Send account verification email
    """
    subject = f"{settings.PROJECT_NAME} - Verify your email"
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    send_email(
        email_to=email_to,
        subject=subject,
        template_name="verify_email",
        template_vars={
            "username": username,
            "verification_url": verification_url,
            "valid_hours": 24,  # Token valid for 24 hours
        },
    )

def send_reset_password_email(email_to: str, username: str, token: str) -> None:
    """
    Send password reset email
    """
    subject = f"{settings.PROJECT_NAME} - Reset your password"
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    send_email(
        email_to=email_to,
        subject=subject,
        template_name="reset_password",
        template_vars={
            "username": username,
            "reset_url": reset_url,
        },
    )

def send_password_changed_notification(email_to: str, username: str) -> None:
    """
    Send notification when password is changed
    """
    subject = f"{settings.PROJECT_NAME} - Password Changed"
    
    send_email(
        email_to=email_to,
        subject=subject,
        template_name="password_changed",
        template_vars={
            "username": username,
            "contact_email": settings.CONTACT_EMAIL,
        },
    )
