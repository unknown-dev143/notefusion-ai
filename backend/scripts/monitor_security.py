"""Security monitoring script for NoteFusion AI."""
import os
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('security_monitor')

class SecurityMonitor:
    """Monitor security events and send alerts."""
    
    def __init__(self):
        self.alert_thresholds = {
            'rate_limit': 10,  # Number of rate limit events before alert
            'content_moderation': 5,  # Number of content violations before alert
            'auth_failure': 5,  # Number of auth failures before alert
        }
        self.event_counts = {
            'rate_limit': 0,
            'content_moderation': 0,
            'auth_failure': 0,
            'last_reset': datetime.utcnow()
        }
    
    def check_events(self, log_file: str = 'app.log') -> Dict[str, List[dict]]:
        """Check log file for security events."""
        events = {
            'rate_limit': [],
            'content_moderation': [],
            'auth_failure': [],
            'other': []
        }
        
        try:
            with open(log_file, 'r') as f:
                for line in f:
                    if 'WARNING' in line or 'ERROR' in line:
                        log_entry = json.loads(line)
                        if 'rate_limit' in log_entry.get('message', '').lower():
                            events['rate_limit'].append(log_entry)
                            self.event_counts['rate_limit'] += 1
                        elif 'moderation' in log_entry.get('message', '').lower():
                            events['content_moderation'].append(log_entry)
                            self.event_counts['content_moderation'] += 1
                        elif 'auth' in log_entry.get('message', '').lower() and 'fail' in log_entry.get('message', '').lower():
                            events['auth_failure'].append(log_entry)
                            self.event_counts['auth_failure'] += 1
                        else:
                            events['other'].append(log_entry)
        except FileNotFoundError:
            logger.warning(f"Log file {log_file} not found")
        
        return events
    
    def check_thresholds(self) -> List[str]:
        """Check if any thresholds have been exceeded."""
        alerts = []
        
        for event_type, threshold in self.alert_thresholds.items():
            if self.event_counts[event_type] >= threshold:
                alerts.append(f"{event_type} threshold exceeded: {self.event_counts[event_type]} events")
        
        # Reset counts if it's been more than an hour
        if datetime.utcnow() - self.event_counts['last_reset'] > timedelta(hours=1):
            self.event_counts = {k: 0 for k in self.event_counts if k != 'last_reset'}
            self.event_counts['last_reset'] = datetime.utcnow()
        
        return alerts
    
    def send_alert(self, subject: str, message: str) -> bool:
        """Send an alert via email."""
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        alert_email = os.getenv('ALERT_EMAIL')
        
        if not all([smtp_server, smtp_user, smtp_password, alert_email]):
            logger.warning("Email alert configuration is incomplete")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = alert_email
            msg['Subject'] = f"[NoteFusion Security Alert] {subject}"
            msg.attach(MIMEText(message, 'plain'))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            logger.info(f"Alert sent: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send alert: {e}")
            return False

def main():
    """Main monitoring function."
    monitor = SecurityMonitor()
    
    # Check for security events
    events = monitor.check_events()
    
    # Check if any thresholds have been exceeded
    alerts = monitor.check_thresholds()
    
    # Send alerts if needed
    for alert in alerts:
        monitor.send_alert("Security Threshold Exceeded", alert)
    
    # Log summary
    logger.info(f"Security check complete. Events: {sum(len(v) for v in events.values())}")

if __name__ == "__main__":
    main()
