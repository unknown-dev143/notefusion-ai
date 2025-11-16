# NoteFusion AI Monitoring System

This document provides instructions for setting up and managing the security monitoring system for NoteFusion AI.

## Features

- **Log Analysis**: Monitors application logs for security-related events
- **Alerting**: Sends email alerts when thresholds are exceeded
- **Scheduled Scans**: Runs daily checks for security events
- **Rate Limiting**: Tracks and alerts on rate limit violations
- **Content Moderation**: Monitors for content policy violations

## Prerequisites

- Python 3.8+
- PowerShell 5.1+
- Administrative privileges (for scheduled task setup)
- SMTP server credentials (for email alerts)

## Setup

1. **Install Dependencies**
   ```powershell
   .\venv\Scripts\activate
   pip install -r backend/requirements-dev.txt
   ```

2. **Configure Environment**
   Create or update `.env` with these settings:
   ```env
   # SMTP Configuration
   SMTP_SERVER=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-email-password
   ALERT_EMAIL=admin@example.com
   
   # Monitoring Settings
   LOG_LEVEL=INFO
   LOG_FILE=logs/security_monitor.log
   ```

3. **Setup Scheduled Task**
   Run as Administrator:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\setup_monitoring.ps1
   ```

## Manual Testing

Run the monitoring script manually:
```powershell
.\venv\Scripts\python.exe backend/scripts/monitor_security.py
```

## Log Files

- `logs/security_monitor.log`: Monitoring system logs
- `logs/security_events.log`: Security events (JSON format)

## Alert Thresholds

| Event Type         | Threshold | Description                     |
|--------------------|-----------|---------------------------------|
| Rate Limit         | 10        | Rate limit violations per hour  |
| Content Moderation | 5         | Policy violations per hour      |
| Auth Failures      | 5         | Failed login attempts per hour  |

## Troubleshooting

1. **Script not running**
   - Check if Python and required packages are installed
   - Verify file paths in the scheduled task
   - Check Windows Event Viewer for errors

2. **No alerts received**
   - Verify SMTP settings in `.env`
   - Check spam/junk folder
   - Review monitoring logs

3. **False positives**
   - Adjust thresholds in `monitor_security.py`
   - Update patterns in the monitoring script

## Maintenance

- Rotate log files regularly
- Update monitoring patterns as needed
- Review and update thresholds based on usage patterns

## Security Notes

- Store `.env` securely and never commit to version control
- Use application-specific passwords for email accounts
- Regularly review and rotate credentials
- Monitor the monitoring system itself for failures
