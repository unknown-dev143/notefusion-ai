"""
app/utils/email.py
------------------
Async email helper for NoteFusion AI.

Uses aiosmtplib if available.  If SMTP is not configured (or aiosmtplib
is not installed) we fall back to printing the message to the console so
local development still works without any SMTP setup.
"""

import logging
import os
from email.message import EmailMessage
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

# Optional import – the app should not crash if aiosmtplib is not installed
try:
    import aiosmtplib  # type: ignore
    _HAS_AIOSMTPLIB = True
except ImportError:
    _HAS_AIOSMTPLIB = False
    logger.warning(
        "aiosmtplib not installed – email sending disabled. "
        "Run: pip install aiosmtplib"
    )


def send_email_async(
    to_address: str,
    subject: str,
    body: str,
    background: BackgroundTasks,
) -> None:
    """Queue an email to be sent in a FastAPI background task.

    If SMTP is not configured, the email content is printed to the
    console instead so you can still test flows locally.
    """
    smtp_host = os.getenv("EMAIL_SMTP_HOST", "")
    smtp_configured = bool(smtp_host and smtp_host not in ("", "localhost"))

    async def _send() -> None:
        # ----------------------------------------------------------------
        # Fast-path: no SMTP or library – just log and return
        # ----------------------------------------------------------------
        if not smtp_configured or not _HAS_AIOSMTPLIB:
            logger.info(
                "=== EMAIL (no SMTP configured) ===\n"
                "To:      %s\n"
                "Subject: %s\n"
                "Body:\n%s\n"
                "==================================",
                to_address, subject, body,
            )
            print(f"\n[NoteFusion Email]\nTo: {to_address}\nSubject: {subject}\n{body}\n")
            return

        # ----------------------------------------------------------------
        # Real send via SMTP
        # ----------------------------------------------------------------
        message = EmailMessage()
        message["From"] = os.getenv("EMAIL_SENDER", "noreply@notefusion.ai")
        message["To"] = to_address
        message["Subject"] = subject
        message.set_content(body)

        try:
            await aiosmtplib.send(
                message,
                hostname=smtp_host,
                port=int(os.getenv("EMAIL_SMTP_PORT", "587")),
                username=os.getenv("EMAIL_USERNAME") or None,
                password=os.getenv("EMAIL_PASSWORD") or None,
                start_tls=os.getenv("EMAIL_USE_TLS", "true").lower() == "true",
            )
            logger.info("Email sent to %s: %s", to_address, subject)
        except Exception as exc:
            logger.error("Failed to send email to %s: %s", to_address, exc)

    background.add_task(_send)
